export const DEFAULT_CHAT_MODEL = "openai/gpt-5.6-luna";
export const DEFAULT_FALLBACK_MODEL = "openai/gpt-5.4-mini";
export const DEFAULT_STT_MODEL = "openai/whisper-large-v3-turbo";
/** OpenRouter no longer lists OpenAI TTS. Kokoro is the live speech model with distinct voices. */
export const DEFAULT_TTS_MODEL = "hexgrad/kokoro-82m";
export const DEFAULT_TTS_VOICE = "bf_emma";
export const FALLBACK_TTS_MODEL = "hexgrad/kokoro-82m";
export const FALLBACK_TTS_VOICE = "bm_george";
export const HIGHER_QUALITY_TTS_MODEL = "google/gemini-3.1-flash-tts-preview";
export const HIGHER_QUALITY_TTS_VOICE = "Kore";
export const TEACHER_SPEAK_INSTRUCTIONS =
  "Speak as a calm British Year 7 teacher having a conversation. Natural pace, warm, unhurried. Do not sound robotic, theatrical, or like a cartoon. Read all mathematics in ordinary English: 2/7 is two sevenths, 1/2 is one half, + is plus, = is equals. Never say backslash, frac, brace, dollar, LaTeX, or spell symbols character by character.";
export const DEFAULT_MAX_TOKENS = 400;
export const DEFAULT_DAILY_CAP = 200;
export const MAX_MESSAGE_CHARS = 2000;
export const MAX_HISTORY = 8;
export const MAX_AUDIO_BYTES = Math.floor(1.5 * 1024 * 1024);
export const MAX_RECORDING_MS = 30_000;
export const MAX_TOOL_ROUNDS = 2;
export const TTS_MAX_CHARS = 800;
export const EXCERPT_MAX_CHARS = 1500;

export type TeacherPresetId = "recommended" | "budget" | "higherQuality";

export type TeacherPreset = {
  id: TeacherPresetId;
  label: string;
  description: string;
  teacherChatModel: string;
  teacherFallbackModel: string;
  speechToTextModel: string;
  textToSpeechModel: string;
  ttsVoice: string;
};

export const TEACHER_PRESETS: TeacherPreset[] = [
  {
    id: "recommended",
    label: "Recommended",
    description: "Best overall balance of teaching quality and cost.",
    teacherChatModel: DEFAULT_CHAT_MODEL,
    teacherFallbackModel: DEFAULT_FALLBACK_MODEL,
    speechToTextModel: DEFAULT_STT_MODEL,
    textToSpeechModel: DEFAULT_TTS_MODEL,
    ttsVoice: DEFAULT_TTS_VOICE,
  },
  {
    id: "budget",
    label: "Budget",
    description: "Lowest-cost sensible models that still tutor well.",
    teacherChatModel: DEFAULT_FALLBACK_MODEL,
    teacherFallbackModel: "deepseek/deepseek-v4-flash",
    speechToTextModel: DEFAULT_STT_MODEL,
    textToSpeechModel: FALLBACK_TTS_MODEL,
    ttsVoice: FALLBACK_TTS_VOICE,
  },
  {
    id: "higherQuality",
    label: "Higher quality",
    description: "More capable models. Costs more per question.",
    teacherChatModel: "anthropic/claude-sonnet-4.6",
    teacherFallbackModel: DEFAULT_CHAT_MODEL,
    speechToTextModel: "openai/whisper-large-v3",
    textToSpeechModel: HIGHER_QUALITY_TTS_MODEL,
    ttsVoice: HIGHER_QUALITY_TTS_VOICE,
  },
];

export function presetById(id: string): TeacherPreset | null {
  return TEACHER_PRESETS.find((p) => p.id === id) ?? null;
}

export type TtsEngine = "kokoro" | "gemini" | "openai" | "other";

export type TeacherVoice = {
  id: string;
  label: string;
  hint: string;
  engine: TtsEngine;
};

export const TTS_VOICES: TeacherVoice[] = [
  { id: "bf_emma", label: "Emma", hint: "British, calm teacher", engine: "kokoro" },
  { id: "bf_isabella", label: "Isabella", hint: "British female", engine: "kokoro" },
  { id: "bf_alice", label: "Alice", hint: "British, bright", engine: "kokoro" },
  { id: "bf_lily", label: "Lily", hint: "British, soft", engine: "kokoro" },
  { id: "bm_george", label: "George", hint: "British teacher", engine: "kokoro" },
  { id: "bm_daniel", label: "Daniel", hint: "British male", engine: "kokoro" },
  { id: "bm_lewis", label: "Lewis", hint: "British male, younger", engine: "kokoro" },
  { id: "bm_fable", label: "Fable", hint: "British storyteller", engine: "kokoro" },
  { id: "af_bella", label: "Bella", hint: "American female", engine: "kokoro" },
  { id: "af_sarah", label: "Sarah", hint: "American female", engine: "kokoro" },
  { id: "af_nova", label: "Nova", hint: "American, bright", engine: "kokoro" },
  { id: "af_alloy", label: "Alloy", hint: "American, neutral", engine: "kokoro" },
  { id: "am_michael", label: "Michael", hint: "American male", engine: "kokoro" },
  { id: "am_echo", label: "Echo", hint: "American male, clear", engine: "kokoro" },
  { id: "am_onyx", label: "Onyx", hint: "American male, deep", engine: "kokoro" },
  { id: "Kore", label: "Kore", hint: "Warm and clear", engine: "gemini" },
  { id: "Aoede", label: "Aoede", hint: "Soft and expressive", engine: "gemini" },
  { id: "Leda", label: "Leda", hint: "Bright", engine: "gemini" },
  { id: "Puck", label: "Puck", hint: "Lively", engine: "gemini" },
  { id: "Charon", label: "Charon", hint: "Low and even", engine: "gemini" },
  { id: "Fenrir", label: "Fenrir", hint: "Deep male", engine: "gemini" },
  { id: "Orus", label: "Orus", hint: "Steady", engine: "gemini" },
  { id: "Zephyr", label: "Zephyr", hint: "Light and airy", engine: "gemini" },
];

/** Saved OpenAI TTS ids that OpenRouter no longer serves. */
const RETIRED_OPENAI_TTS = [
  "openai/gpt-4o-mini-tts-2025-12-15",
  "openai/gpt-4o-mini-tts",
  "openai/tts-1",
  "openai/tts-1-hd",
];

/** Old OpenAI voice names → distinct Kokoro voices so previews no longer collapse to George. */
const OPENAI_TO_KOKORO: Record<string, string> = {
  sage: "bf_emma",
  coral: "bf_isabella",
  verse: "bm_daniel",
  ballad: "bf_lily",
  ash: "bm_lewis",
  fable: "bm_fable",
  alloy: "af_alloy",
  echo: "am_echo",
  onyx: "am_onyx",
  nova: "af_nova",
  shimmer: "bf_alice",
  marin: "bf_alice",
  cedar: "bm_george",
};

const OPENAI_TO_GEMINI: Record<string, string> = {
  sage: "Kore",
  coral: "Aoede",
  verse: "Charon",
  ballad: "Leda",
  ash: "Fenrir",
  fable: "Orus",
  alloy: "Puck",
  echo: "Charon",
  onyx: "Fenrir",
  nova: "Zephyr",
  shimmer: "Leda",
  marin: "Aoede",
  cedar: "Orus",
};

export function isRetiredTtsModel(model: string): boolean {
  const id = model.trim().toLowerCase();
  return RETIRED_OPENAI_TTS.some((retired) => retired === id) || id.includes("gpt-4o-mini-tts");
}

export function normalizeTtsModel(model: string): string {
  const id = model.trim();
  if (!id || isRetiredTtsModel(id)) return DEFAULT_TTS_MODEL;
  return id;
}

export function ttsEngineForModel(model: string): TtsEngine {
  const id = normalizeTtsModel(model).toLowerCase();
  if (id.includes("kokoro")) return "kokoro";
  if (id.includes("gemini") && id.includes("tts")) return "gemini";
  if (id.includes("openai") || id.includes("tts-1")) return "openai";
  return "other";
}

export function voicesForModel(model: string): TeacherVoice[] {
  const engine = ttsEngineForModel(model);
  if (engine === "other" || engine === "openai") {
    return TTS_VOICES.filter((row) => row.engine === "kokoro");
  }
  return TTS_VOICES.filter((row) => row.engine === engine);
}

export function voiceById(id: string): TeacherVoice | undefined {
  return TTS_VOICES.find((row) => row.id === id);
}

export function defaultVoiceForModel(model: string): string {
  const engine = ttsEngineForModel(model);
  if (engine === "gemini") return HIGHER_QUALITY_TTS_VOICE;
  if (engine === "kokoro") return DEFAULT_TTS_VOICE;
  return DEFAULT_TTS_VOICE;
}

function mapVoiceForEngine(engine: TtsEngine, voice: string): string {
  if (engine === "gemini") return OPENAI_TO_GEMINI[voice] ?? voice;
  return OPENAI_TO_KOKORO[voice] ?? voice;
}

export function resolveVoiceForModel(model: string, voice: string): string {
  const liveModel = normalizeTtsModel(model);
  const engine = ttsEngineForModel(liveModel);
  const mapped = mapVoiceForEngine(engine, voice);
  const allowed = voicesForModel(liveModel);
  if (allowed.some((row) => row.id === mapped)) return mapped;
  if (allowed.some((row) => row.id === voice)) return voice;
  return defaultVoiceForModel(liveModel);
}

export function resolveTtsRequest(
  model: string,
  voice: string,
): { model: string; voice: string } {
  const liveModel = normalizeTtsModel(model);
  return {
    model: liveModel,
    voice: resolveVoiceForModel(liveModel, voice),
  };
}
