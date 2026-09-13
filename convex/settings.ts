import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireParent } from "./authHelpers";
import {
  DEFAULT_CHAT_MODEL,
  DEFAULT_DAILY_CAP,
  DEFAULT_FALLBACK_MODEL,
  DEFAULT_MAX_TOKENS,
  DEFAULT_STT_MODEL,
  DEFAULT_TTS_MODEL,
  DEFAULT_TTS_VOICE,
  resolveTtsRequest,
} from "./lib/aiPresets";

const DEFAULT_BUILDER_MODEL = "openai/gpt-5.4-mini";

const teacherRuntime = v.object({
  key: v.union(v.string(), v.null()),
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
});

function resolveKey(doc: { openRouterKey?: string } | null): string | null {
  const fromSettings = doc?.openRouterKey?.trim();
  if (fromSettings) return fromSettings;
  const fromEnv = process.env.OPENROUTER_API_KEY?.trim();
  return fromEnv || null;
}

function teacherFromDoc(doc: {
  teacherEnabled?: boolean;
  teacherChatModel?: string;
  teacherFallbackModel?: string;
  speechToTextModel?: string;
  textToSpeechModel?: string;
  ttsVoice?: string;
  voiceInputEnabled?: boolean;
  spokenRepliesEnabled?: boolean;
  maxResponseTokens?: number;
  dailyRequestCap?: number;
  openRouterKey?: string;
} | null) {
  const tts = resolveTtsRequest(
    doc?.textToSpeechModel ?? DEFAULT_TTS_MODEL,
    doc?.ttsVoice ?? DEFAULT_TTS_VOICE,
  );
  return {
    key: resolveKey(doc),
    teacherEnabled: doc?.teacherEnabled ?? true,
    teacherChatModel: doc?.teacherChatModel ?? DEFAULT_CHAT_MODEL,
    teacherFallbackModel: doc?.teacherFallbackModel ?? DEFAULT_FALLBACK_MODEL,
    speechToTextModel: doc?.speechToTextModel ?? DEFAULT_STT_MODEL,
    textToSpeechModel: tts.model,
    ttsVoice: tts.voice,
    voiceInputEnabled: doc?.voiceInputEnabled ?? true,
    spokenRepliesEnabled: doc?.spokenRepliesEnabled ?? true,
    maxResponseTokens: doc?.maxResponseTokens ?? DEFAULT_MAX_TOKENS,
    dailyRequestCap: doc?.dailyRequestCap ?? DEFAULT_DAILY_CAP,
  };
}

/** Client-facing AI config. The raw key is NEVER returned — only keyIsSet. */
export const getAiConfig = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("settings").first();
    return {
      keyIsSet: !!resolveKey(doc),
      model: doc?.openRouterModel ?? DEFAULT_BUILDER_MODEL,
      youtubeSearchEnabled: doc?.youtubeSearchEnabled ?? false,
    };
  },
});

export const getTeacherUiConfig = query({
  args: {},
  returns: v.object({
    enabled: v.boolean(),
    voiceInputEnabled: v.boolean(),
    spokenRepliesEnabled: v.boolean(),
    keyIsSet: v.boolean(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return {
        enabled: false,
        voiceInputEnabled: false,
        spokenRepliesEnabled: true,
        keyIsSet: false,
      };
    }
    const doc = await ctx.db.query("settings").first();
    const t = teacherFromDoc(doc);
    return {
      enabled: t.teacherEnabled,
      voiceInputEnabled: t.voiceInputEnabled,
      spokenRepliesEnabled: t.spokenRepliesEnabled,
      keyIsSet: !!t.key,
    };
  },
});

export const getTeacherSettings = query({
  args: {},
  returns: v.object({
    keyIsSet: v.boolean(),
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
  }),
  handler: async (ctx) => {
    await requireParent(ctx);
    const doc = await ctx.db.query("settings").first();
    const t = teacherFromDoc(doc);
    return {
      keyIsSet: !!t.key,
      teacherEnabled: t.teacherEnabled,
      teacherChatModel: t.teacherChatModel,
      teacherFallbackModel: t.teacherFallbackModel,
      speechToTextModel: t.speechToTextModel,
      textToSpeechModel: t.textToSpeechModel,
      ttsVoice: t.ttsVoice,
      voiceInputEnabled: t.voiceInputEnabled,
      spokenRepliesEnabled: t.spokenRepliesEnabled,
      maxResponseTokens: t.maxResponseTokens,
      dailyRequestCap: t.dailyRequestCap,
    };
  },
});

/** Parent-only: save the BYOK key + builder model. */
export const saveAiConfig = mutation({
  args: {
    openRouterKey: v.optional(v.string()),
    openRouterModel: v.string(),
    youtubeSearchEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const existing = await ctx.db.query("settings").first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        openRouterKey:
          args.openRouterKey !== undefined && args.openRouterKey !== ""
            ? args.openRouterKey
            : existing.openRouterKey,
        openRouterModel: args.openRouterModel,
        youtubeSearchEnabled: args.youtubeSearchEnabled,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("settings", {
      openRouterKey: args.openRouterKey ?? undefined,
      openRouterModel: args.openRouterModel,
      youtubeSearchEnabled: args.youtubeSearchEnabled,
      updatedAt: now,
    });
  },
});

/** Internal: raw key + builder model for the course builder (parent-only). */
export const getAiConfigInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    const doc = await ctx.db.query("settings").first();
    return {
      key: resolveKey(doc),
      model: doc?.openRouterModel ?? DEFAULT_BUILDER_MODEL,
      youtubeSearchEnabled: doc?.youtubeSearchEnabled ?? false,
    };
  },
});

/** Internal: teacher runtime. No parent check — callers must already be authed. */
export const getTeacherRuntimeConfig = internalQuery({
  args: {},
  returns: teacherRuntime,
  handler: async (ctx) => {
    const doc = await ctx.db.query("settings").first();
    return teacherFromDoc(doc);
  },
});

export const saveTeacherConfigInternal = internalMutation({
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const existing = await ctx.db.query("settings").first();
    const now = Date.now();
    const tts = resolveTtsRequest(args.textToSpeechModel, args.ttsVoice);
    const patch = {
      teacherEnabled: args.teacherEnabled,
      teacherChatModel: args.teacherChatModel,
      teacherFallbackModel: args.teacherFallbackModel,
      speechToTextModel: args.speechToTextModel,
      textToSpeechModel: tts.model,
      ttsVoice: tts.voice,
      voiceInputEnabled: args.voiceInputEnabled,
      spokenRepliesEnabled: args.spokenRepliesEnabled,
      maxResponseTokens: args.maxResponseTokens,
      dailyRequestCap: args.dailyRequestCap,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return null;
    }
    await ctx.db.insert("settings", {
      openRouterModel: DEFAULT_BUILDER_MODEL,
      youtubeSearchEnabled: false,
      ...patch,
    });
    return null;
  },
});

/** One-shot: turn on talking teacher (voice in + spoken replies) with the recommended voice. */
export const turnOnSpokenTeacher = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("settings").first();
    if (!existing) return null;
    await ctx.db.patch(existing._id, {
      spokenRepliesEnabled: true,
      voiceInputEnabled: true,
      textToSpeechModel: DEFAULT_TTS_MODEL,
      ttsVoice: DEFAULT_TTS_VOICE,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/** Rewrite retired OpenAI TTS ids so Preview and chat use a live Kokoro voice. */
export const remapRetiredTts = internalMutation({
  args: {},
  returns: v.object({
    patched: v.boolean(),
    textToSpeechModel: v.union(v.string(), v.null()),
    ttsVoice: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    const existing = await ctx.db.query("settings").first();
    if (!existing) {
      return { patched: false, textToSpeechModel: null, ttsVoice: null };
    }
    const tts = resolveTtsRequest(
      existing.textToSpeechModel ?? DEFAULT_TTS_MODEL,
      existing.ttsVoice ?? DEFAULT_TTS_VOICE,
    );
    const modelUnchanged = existing.textToSpeechModel === tts.model;
    const voiceUnchanged = existing.ttsVoice === tts.voice;
    if (modelUnchanged && voiceUnchanged) {
      return { patched: false, textToSpeechModel: tts.model, ttsVoice: tts.voice };
    }
    await ctx.db.patch(existing._id, {
      textToSpeechModel: tts.model,
      ttsVoice: tts.voice,
      updatedAt: Date.now(),
    });
    return { patched: true, textToSpeechModel: tts.model, ttsVoice: tts.voice };
  },
});
