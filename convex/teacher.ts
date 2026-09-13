import { action, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  MAX_AUDIO_BYTES,
  MAX_HISTORY,
  MAX_MESSAGE_CHARS,
  MAX_TOOL_ROUNDS,
  FALLBACK_TTS_MODEL,
  TEACHER_PRESETS,
  TEACHER_SPEAK_INSTRUCTIONS,
  TTS_MAX_CHARS,
  isRetiredTtsModel,
  resolveTtsRequest,
} from "./lib/aiPresets";
import {
  arrayBufferToBase64,
  modelSupportsSlot,
  openRouterChat,
  openRouterListModels,
  openRouterSpeak,
  openRouterTranscribe,
  type CatalogueModel,
  type ChatMessage,
  type ChatResult,
  type ToolSpec,
} from "./lib/openrouter";
import { formatAppContext, sanitizeAppContext, type TeacherAppContext } from "./lib/teacherContext";
import { parseTeacherReply, speechPlainText, teacherSystemPrompt } from "./lib/teacherPrompt";

type TeacherRuntime = {
  key: string | null;
  teacherEnabled: boolean;
  teacherChatModel: string;
  teacherFallbackModel: string;
  speechToTextModel: string;
  textToSpeechModel: string;
  ttsVoice: string;
  voiceInputEnabled: boolean;
  spokenRepliesEnabled: boolean;
  maxResponseTokens: number;
  dailyRequestCap: number;
};

type ChatReply = {
  message: string;
  suggestions: string[];
  audioBase64: string | null;
};

const CATALOGUE_TTL_MS = 6 * 60 * 60 * 1000;

const catalogueCache = new Map<
  "chat" | "transcription" | "speech",
  { at: number; models: CatalogueModel[] }
>();

const appContextValidator = v.object({
  page: v.string(),
  subjectName: v.optional(v.string()),
  lessonTitle: v.optional(v.string()),
  lessonId: v.optional(v.string()),
  section: v.optional(v.string()),
  currentQuestionText: v.optional(v.string()),
  currentQuestionOptions: v.optional(v.array(v.string())),
  currentQuestionIndex: v.optional(v.number()),
  currentQuestionTotal: v.optional(v.number()),
  videoPercent: v.optional(v.number()),
  todayLessons: v.optional(
    v.array(
      v.object({
        subjectName: v.string(),
        title: v.string(),
        completed: v.boolean(),
      }),
    ),
  ),
  excerpt: v.optional(v.string()),
  today: v.optional(v.string()),
});

const catalogueRow = v.object({
  id: v.string(),
  name: v.string(),
  provider: v.string(),
  pricingPrompt: v.union(v.string(), v.null()),
  pricingCompletion: v.union(v.string(), v.null()),
  pricingAudio: v.union(v.string(), v.null()),
  contextLength: v.union(v.number(), v.null()),
  tools: v.boolean(),
  structured: v.boolean(),
  vision: v.boolean(),
});

const TOOL_SPECS: ToolSpec[] = [
  {
    type: "function",
    function: {
      name: "getTodaysLessons",
      description: "List today's planned lessons with titles and whether they are done.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getLessonsForDate",
      description: "List planned lessons for a date. Use for tomorrow or another school day.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "yyyy-mm-dd, or the words today or tomorrow",
          },
        },
        required: ["date"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getSubjectProgress",
      description: "Average quiz percentages by topic. Optional subject name filter (e.g. maths).",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string", description: "Subject name or slug to filter" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getRecentQuizResults",
      description: "Latest quiz scores as percentages with titles only. No per-question answers.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

const ALLOWED_TOOLS = new Set(TOOL_SPECS.map((t) => t.function.name));

function childSafe(error: unknown, fallback: string): Error {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("OpenRouter") || message.includes("Empty transcript")) {
    console.error("Teacher provider error");
  } else if (message) {
    console.error("Teacher error");
  }
  return new Error(fallback);
}

function clip(text: string, max: number): string {
  return text.trim().slice(0, max);
}

function base64ByteLength(b64: string): number {
  const pad = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - pad;
}

function toISO(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function resolveDate(raw: string, now: number): string | null {
  const value = raw.trim().toLowerCase();
  if (value === "today") return toISO(now);
  if (value === "tomorrow") {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + 1);
    return toISO(d.getTime());
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();
  return null;
}

function slimCatalogue(models: CatalogueModel[]) {
  return models.slice(0, 200).map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    pricingPrompt: m.pricingPrompt,
    pricingCompletion: m.pricingCompletion,
    pricingAudio: m.pricingAudio,
    contextLength: m.contextLength,
    tools: m.tools,
    structured: m.structured,
    vision: m.vision,
  }));
}

async function loadCatalogue(
  key: string,
  modality: "chat" | "transcription" | "speech",
  refresh: boolean,
): Promise<CatalogueModel[]> {
  const hit = catalogueCache.get(modality);
  if (!refresh && hit && Date.now() - hit.at < CATALOGUE_TTL_MS) {
    return hit.models;
  }
  const models = await openRouterListModels(key, modality);
  catalogueCache.set(modality, { at: Date.now(), models });
  return models;
}

function findModel(
  models: CatalogueModel[],
  id: string,
  slot: "chat" | "transcription" | "speech",
): CatalogueModel | null {
  const row = models.find((m) => m.id === id);
  if (!row || !modelSupportsSlot(row, slot)) return null;
  return row;
}

function isPresetId(id: string, slot: "chat" | "fallback" | "transcription" | "speech"): boolean {
  return TEACHER_PRESETS.some((p) => {
    if (slot === "chat") return p.teacherChatModel === id;
    if (slot === "fallback") return p.teacherFallbackModel === id;
    if (slot === "transcription") return p.speechToTextModel === id;
    return p.textToSpeechModel === id;
  });
}

async function runAllowlistedTool(
  ctx: ActionCtx,
  name: string,
  argsJson: string,
  now: number,
): Promise<string> {
  if (!ALLOWED_TOOLS.has(name)) {
    return JSON.stringify({ error: "unknown tool" });
  }
  let parsed: Record<string, unknown> = {};
  try {
    const raw: unknown = JSON.parse(argsJson || "{}");
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      parsed = raw as Record<string, unknown>;
    }
  } catch {
    return JSON.stringify({ error: "bad arguments" });
  }

  try {
    if (name === "getTodaysLessons") {
      const rows = await ctx.runQuery(internal.teacherTools.getTodaysLessons, { now });
      return JSON.stringify(rows);
    }
    if (name === "getLessonsForDate") {
      const date = typeof parsed.date === "string" ? resolveDate(parsed.date, now) : null;
      if (!date) return JSON.stringify({ error: "Need a date like tomorrow or 2026-09-14" });
      const rows = await ctx.runQuery(internal.teacherTools.getLessonsForDate, { date });
      return JSON.stringify(rows);
    }
    if (name === "getSubjectProgress") {
      const subject = typeof parsed.subject === "string" ? parsed.subject.slice(0, 80) : undefined;
      const rows = await ctx.runQuery(
        internal.teacherTools.getSubjectProgress,
        subject ? { subject } : {},
      );
      return JSON.stringify(rows);
    }
    if (name === "getRecentQuizResults") {
      const rows = await ctx.runQuery(internal.teacherTools.getRecentQuizResults, {});
      return JSON.stringify(rows);
    }
  } catch {
    console.error("Teacher tool failed");
    return JSON.stringify({ error: "unavailable" });
  }
  return JSON.stringify({ error: "unknown tool" });
}

async function completeChat(opts: {
  key: string;
  model: string;
  fallbackModel: string;
  messages: ChatMessage[];
  maxTokens: number;
  tools: ToolSpec[];
}): Promise<ChatResult> {
  const run = (zdr: boolean) =>
    openRouterChat({
      key: opts.key,
      model: opts.model,
      fallbackModel: opts.fallbackModel,
      messages: opts.messages,
      maxTokens: opts.maxTokens,
      tools: opts.tools,
      zdr,
    });

  try {
    return await run(true);
  } catch {
    console.error("Teacher chat ZDR retry");
    return await run(false);
  }
}

async function maybeSpeak(opts: {
  key: string;
  model: string;
  voice: string;
  text: string;
}): Promise<string | null> {
  const input = speechPlainText(clip(opts.text, TTS_MAX_CHARS));
  if (!input) return null;

  const primary = resolveTtsRequest(opts.model, opts.voice);
  const kokoro = resolveTtsRequest(FALLBACK_TTS_MODEL, opts.voice);
  const attempts: Array<{ model: string; voice: string }> = [primary];
  if (primary.model !== kokoro.model || primary.voice !== kokoro.voice) {
    attempts.push(kokoro);
  }

  const unique = attempts.filter(
    (attempt, index, list) =>
      !isRetiredTtsModel(attempt.model) &&
      list.findIndex((row) => row.model === attempt.model && row.voice === attempt.voice) === index,
  );

  for (const attempt of unique) {
    try {
      const audio = await openRouterSpeak({
        key: opts.key,
        model: attempt.model,
        input,
        voice: attempt.voice,
        instructions: attempt.model.toLowerCase().includes("openai")
          ? TEACHER_SPEAK_INSTRUCTIONS
          : undefined,
      });
      return arrayBufferToBase64(audio);
    } catch (error) {
      console.error(
        "Teacher TTS attempt failed",
        attempt.model,
        attempt.voice,
        error instanceof Error ? error.message : "unknown",
      );
    }
  }
  return null;
}

export const chat = action({
  args: {
    message: v.string(),
    history: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      }),
    ),
    appContext: v.optional(appContextValidator),
    speak: v.optional(v.boolean()),
    now: v.optional(v.number()),
  },
  returns: v.object({
    message: v.string(),
    suggestions: v.array(v.string()),
    audioBase64: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args): Promise<ChatReply> => {
    const actor: {
      role: "parent" | "student";
      displayName: string;
      reducedMotion: boolean;
    } | null = await ctx.runQuery(internal.teacherAuth.getActor, {});
    if (!actor) throw new Error("Not authenticated");

    const config: TeacherRuntime = await ctx.runQuery(internal.settings.getTeacherRuntimeConfig, {});
    if (!config.teacherEnabled) {
      throw new Error("Cosmo is taking a rest. Ask a parent to turn me back on.");
    }
    if (!config.key) {
      throw new Error("Cosmo isn't set up yet. Ask a parent to add an API key in Settings.");
    }

    const text = clip(args.message, MAX_MESSAGE_CHARS);
    if (!text) throw new Error("Type a question for Cosmo.");

    const firstName = actor.displayName.split(" ")[0] || "Hudson";
    const now = args.now && Number.isFinite(args.now) ? args.now : Date.now();
    const sanitized = sanitizeAppContext(args.appContext as TeacherAppContext | undefined);
    if (sanitized && !sanitized.today) sanitized.today = toISO(now);

    const messages: ChatMessage[] = [
      { role: "system", content: teacherSystemPrompt(firstName) },
    ];
    if (sanitized) {
      messages.push({ role: "system", content: formatAppContext(sanitized) });
    }
    for (const turn of args.history.slice(-MAX_HISTORY)) {
      messages.push({
        role: turn.role,
        content: clip(turn.content, MAX_MESSAGE_CHARS),
      });
    }
    messages.push({ role: "user", content: text });

    let result: ChatResult;
    try {
      result = await completeChat({
        key: config.key,
        model: config.teacherChatModel,
        fallbackModel: config.teacherFallbackModel,
        messages,
        maxTokens: Math.min(Math.max(config.maxResponseTokens, 64), 800),
        tools: TOOL_SPECS,
      });
    } catch (error) {
      throw childSafe(error, "Teacher is taking a break. Try again.");
    }

    let rounds = 0;
    while (result.toolCalls.length > 0 && rounds < MAX_TOOL_ROUNDS) {
      rounds += 1;
      messages.push({
        role: "assistant",
        content: result.content || null,
        tool_calls: result.toolCalls.map((call) => ({
          id: call.id,
          type: "function" as const,
          function: { name: call.name, arguments: call.arguments },
        })),
      });
      for (const call of result.toolCalls) {
        const toolResult = await runAllowlistedTool(ctx, call.name, call.arguments, now);
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: clip(toolResult, 4000),
        });
      }
      try {
        result = await completeChat({
          key: config.key,
          model: config.teacherChatModel,
          fallbackModel: config.teacherFallbackModel,
          messages,
          maxTokens: Math.min(Math.max(config.maxResponseTokens, 64), 800),
          tools: TOOL_SPECS,
        });
      } catch {
        break;
      }
    }

    const parsed = parseTeacherReply(result.content || "I'm here. Try asking that another way.");
    const audioBase64: string | null =
      args.speak && config.spokenRepliesEnabled
        ? await maybeSpeak({
            key: config.key,
            model: config.textToSpeechModel,
            voice: config.ttsVoice,
            text: parsed.message,
          })
        : null;

    return {
      message: parsed.message,
      suggestions: parsed.suggestions,
      audioBase64,
    };
  },
});

export const transcribe = action({
  args: {
    audioBase64: v.string(),
    format: v.union(v.literal("webm"), v.literal("mp4"), v.literal("wav")),
  },
  returns: v.object({
    text: v.union(v.string(), v.null()),
    error: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const actor: {
      role: "parent" | "student";
      displayName: string;
      reducedMotion: boolean;
    } | null = await ctx.runQuery(internal.teacherAuth.getActor, {});
    if (!actor) throw new Error("Not authenticated");

    const config: TeacherRuntime = await ctx.runQuery(internal.settings.getTeacherRuntimeConfig, {});
    if (!config.teacherEnabled || !config.voiceInputEnabled) {
      return { text: null, error: "I can’t hear you. You can type instead." };
    }
    if (!config.key) {
      return { text: null, error: "Cosmo isn't set up yet. Ask a parent to add an API key in Settings." };
    }
    if (base64ByteLength(args.audioBase64) > MAX_AUDIO_BYTES) {
      return { text: null, error: "That recording was a bit long. Try a shorter question." };
    }

    try {
      const text = await openRouterTranscribe({
        key: config.key,
        model: config.speechToTextModel,
        audioBase64: args.audioBase64,
        format: args.format,
      });
      const clipped = clip(text, MAX_MESSAGE_CHARS);
      if (!clipped) return { text: null, error: "I didn’t catch that. Try again or type it." };
      return { text: clipped, error: null };
    } catch (error) {
      console.error("Teacher STT failed");
      void error;
      return { text: null, error: "I didn’t catch that. Try again or type it." };
    }
  },
});

export const speak = action({
  args: { text: v.string() },
  returns: v.object({
    audioBase64: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const actor: {
      role: "parent" | "student";
      displayName: string;
      reducedMotion: boolean;
    } | null = await ctx.runQuery(internal.teacherAuth.getActor, {});
    if (!actor) throw new Error("Not authenticated");
    const config: TeacherRuntime = await ctx.runQuery(internal.settings.getTeacherRuntimeConfig, {});
    if (!config.spokenRepliesEnabled || !config.key) {
      return { audioBase64: null };
    }
    const audioBase64 = await maybeSpeak({
      key: config.key,
      model: config.textToSpeechModel,
      voice: config.ttsVoice,
      text: args.text,
    });
    return { audioBase64 };
  },
});

export const previewSpeech = action({
  args: {
    textToSpeechModel: v.string(),
    ttsVoice: v.string(),
  },
  returns: v.object({
    audioBase64: v.union(v.string(), v.null()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const parentOk: null = await ctx.runQuery(internal.teacherAuth.assertParent, {});
    void parentOk;
    const config: TeacherRuntime = await ctx.runQuery(internal.settings.getTeacherRuntimeConfig, {});
    if (!config.key) {
      return { audioBase64: null, error: "Add an OpenRouter key first." };
    }
    const tts = resolveTtsRequest(clip(args.textToSpeechModel, 120), clip(args.ttsVoice, 40));
    if (!tts.model || !tts.voice) {
      return { audioBase64: null, error: "Choose a voice first." };
    }
    const audioBase64 = await maybeSpeak({
      key: config.key,
      model: tts.model,
      voice: tts.voice,
      text: "Hi Hudson. I am Cosmo, your teacher. This is how I will sound when we work together.",
    });
    if (!audioBase64) {
      return {
        audioBase64: null,
        error: "That voice could not be played. Try another, then save.",
      };
    }
    return { audioBase64 };
  },
});

export const listModels = action({
  args: {
    modality: v.union(v.literal("chat"), v.literal("transcription"), v.literal("speech")),
    refresh: v.optional(v.boolean()),
  },
  returns: v.array(catalogueRow),
  handler: async (ctx, args) => {
    const parentOk: null = await ctx.runQuery(internal.teacherAuth.assertParent, {});
    void parentOk;
    const config: TeacherRuntime = await ctx.runQuery(internal.settings.getTeacherRuntimeConfig, {});
    if (!config.key) return [];
    try {
      const models = await loadCatalogue(config.key, args.modality, args.refresh === true);
      return slimCatalogue(models);
    } catch (error) {
      throw childSafe(error, "Could not load the model list. Try refresh again.");
    }
  },
});

export const saveTeacherConfig = action({
  args: {
    teacherEnabled: v.boolean(),
    teacherChatModel: v.string(),
    teacherFallbackModel: v.string(),
    speechToTextModel: v.string(),
    textToSpeechModel: v.string(),
    ttsVoice: v.string(),
    voiceInputEnabled: v.boolean(),
    spokenRepliesEnabled: v.boolean(),
    maxResponseTokens: v.number(),
    dailyRequestCap: v.number(),
    refreshCatalogue: v.optional(v.boolean()),
  },
  returns: v.object({
    ok: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const parentOk: null = await ctx.runQuery(internal.teacherAuth.assertParent, {});
    void parentOk;
    const config: TeacherRuntime = await ctx.runQuery(internal.settings.getTeacherRuntimeConfig, {});

    const chatId = clip(args.teacherChatModel, 120);
    const fallbackId = clip(args.teacherFallbackModel, 120);
    const sttId = clip(args.speechToTextModel, 120);
    const tts = resolveTtsRequest(clip(args.textToSpeechModel, 120), clip(args.ttsVoice, 40));
    const ttsId = tts.model;
    const voice = tts.voice;
    if (!chatId || !fallbackId || !sttId || !ttsId || !voice) {
      return { ok: false, error: "Choose a model for each slot." };
    }
    if (chatId === sttId || chatId === ttsId) {
      return { ok: false, error: "Chat, speech-to-text, and text-to-speech need different models." };
    }

    if (config.key) {
      try {
        const [chat, stt, tts] = await Promise.all([
          loadCatalogue(config.key, "chat", args.refreshCatalogue === true),
          loadCatalogue(config.key, "transcription", args.refreshCatalogue === true),
          loadCatalogue(config.key, "speech", args.refreshCatalogue === true),
        ]);
        if (!findModel(chat, chatId, "chat") && !isPresetId(chatId, "chat")) {
          return { ok: false, error: "That chat model is not in the text catalogue." };
        }
        if (!findModel(chat, fallbackId, "chat") && !isPresetId(fallbackId, "fallback")) {
          return { ok: false, error: "That fallback model is not a chat model." };
        }
        if (!findModel(stt, sttId, "transcription") && !isPresetId(sttId, "transcription")) {
          return { ok: false, error: "That speech-to-text id cannot be used for transcription." };
        }
        if (!findModel(tts, ttsId, "speech") && !isPresetId(ttsId, "speech")) {
          return { ok: false, error: "That text-to-speech id cannot be used for spoken replies." };
        }
      } catch {
        if (
          !isPresetId(chatId, "chat") ||
          !isPresetId(sttId, "transcription") ||
          !isPresetId(ttsId, "speech")
        ) {
          return { ok: false, error: "Could not check the catalogue. Use a recommended preset, or try Refresh models." };
        }
      }
    }

    const maxTokens = Math.min(Math.max(Math.round(args.maxResponseTokens), 64), 800);
    const dailyCap = Math.min(Math.max(Math.round(args.dailyRequestCap), 10), 2000);

    await ctx.runMutation(internal.settings.saveTeacherConfigInternal, {
      teacherEnabled: args.teacherEnabled,
      teacherChatModel: chatId,
      teacherFallbackModel: fallbackId,
      speechToTextModel: sttId,
      textToSpeechModel: ttsId,
      ttsVoice: voice,
      voiceInputEnabled: args.voiceInputEnabled,
      spokenRepliesEnabled: args.spokenRepliesEnabled,
      maxResponseTokens: maxTokens,
      dailyRequestCap: dailyCap,
    });
    return { ok: true };
  },
});
