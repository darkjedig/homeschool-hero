const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_call_id?: string;
  name?: string;
  tool_calls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }[];
};

export type ToolSpec = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type ToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type ChatResult = {
  content: string;
  toolCalls: ToolCall[];
};

export type CatalogueModel = {
  id: string;
  name: string;
  provider: string;
  pricingPrompt: string | null;
  pricingCompletion: string | null;
  pricingAudio: string | null;
  contextLength: number | null;
  inputModalities: string[];
  outputModalities: string[];
  supportedParameters: string[];
  tools: boolean;
  structured: boolean;
  vision: boolean;
};

type OpenRouterModel = {
  id?: string;
  name?: string;
  context_length?: number;
  architecture?: {
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing?: {
    prompt?: string;
    completion?: string;
    audio?: string;
  };
  supported_parameters?: string[];
};

function headers(key: string): HeadersInit {
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "X-Title": "HomeschoolHero",
  };
}

function failStatus(status: number, text: string): never {
  const snippet = text.replace(/\s+/g, " ").slice(0, 180);
  console.error(`OpenRouter error ${status}`);
  throw new Error(`OpenRouter ${status}${snippet ? `: ${snippet}` : ""}`);
}

export async function openRouterChat(opts: {
  key: string;
  model: string;
  fallbackModel?: string;
  messages: ChatMessage[];
  maxTokens: number;
  tools?: ToolSpec[];
  zdr?: boolean;
}): Promise<ChatResult> {
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    max_tokens: opts.maxTokens,
    temperature: 0.6,
    plugins: [],
  };
  if (opts.fallbackModel && opts.fallbackModel !== opts.model) {
    body.models = [opts.fallbackModel];
  }
  if (opts.tools && opts.tools.length > 0) {
    body.tools = opts.tools;
    body.tool_choice = "auto";
  }
  if (opts.zdr !== false) {
    body.provider = { zdr: true };
  }

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: headers(opts.key),
    body: JSON.stringify(body),
  });
  if (!res.ok) failStatus(res.status, await res.text());

  const data = (await res.json()) as {
    choices?: {
      message?: {
        content?: string | null;
        tool_calls?: { id?: string; function?: { name?: string; arguments?: string } }[];
      };
    }[];
  };
  const message = data.choices?.[0]?.message;
  const toolCalls: ToolCall[] = [];
  for (const call of message?.tool_calls ?? []) {
    const name = call.function?.name;
    const id = call.id;
    if (!name || !id) continue;
    toolCalls.push({
      id,
      name,
      arguments: call.function?.arguments ?? "{}",
    });
  }
  return {
    content: typeof message?.content === "string" ? message.content : "",
    toolCalls,
  };
}

export async function openRouterTranscribe(opts: {
  key: string;
  model: string;
  audioBase64: string;
  format: string;
}): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: headers(opts.key),
    body: JSON.stringify({
      model: opts.model,
      language: "en",
      response_format: "json",
      input_audio: {
        data: opts.audioBase64,
        format: opts.format,
      },
    }),
  });
  if (!res.ok) failStatus(res.status, await res.text());
  const data = (await res.json()) as { text?: string };
  const text = (data.text ?? "").trim();
  if (!text) throw new Error("Empty transcript");
  return text;
}

export async function openRouterSpeak(opts: {
  key: string;
  model: string;
  input: string;
  voice: string;
  instructions?: string;
  speed?: number;
}): Promise<ArrayBuffer> {
  const body: Record<string, string | number> = {
    model: opts.model,
    input: opts.input,
    voice: opts.voice,
    response_format: "mp3",
  };
  if (opts.model.toLowerCase().includes("openai")) {
    if (opts.instructions) body.instructions = opts.instructions;
    if (opts.speed !== undefined) body.speed = opts.speed;
  }
  const res = await fetch(`${OPENROUTER_BASE}/audio/speech`, {
    method: "POST",
    headers: headers(opts.key),
    body: JSON.stringify(body),
  });
  if (!res.ok) failStatus(res.status, await res.text());
  return await res.arrayBuffer();
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export async function openRouterListModels(
  key: string,
  modality: "chat" | "transcription" | "speech",
): Promise<CatalogueModel[]> {
  const url =
    modality === "chat"
      ? `${OPENROUTER_BASE}/models`
      : `${OPENROUTER_BASE}/models?output_modalities=${modality === "transcription" ? "transcription" : "speech"}`;
  const res = await fetch(url, { headers: headers(key) });
  if (!res.ok) failStatus(res.status, await res.text());
  const payload = (await res.json()) as { data?: OpenRouterModel[] };
  const rows: CatalogueModel[] = [];
  for (const raw of payload.data ?? []) {
    const id = raw.id;
    if (!id) continue;
    const input = raw.architecture?.input_modalities ?? [];
    const output = raw.architecture?.output_modalities ?? [];
    const params = raw.supported_parameters ?? [];
    const tools = params.includes("tools");
    const structured =
      params.includes("response_format") || params.includes("structured_outputs");
    const vision = input.includes("image");
    if (modality === "chat") {
      const textOut = output.length === 0 || output.includes("text");
      if (!textOut) continue;
    }
    rows.push({
      id,
      name: raw.name ?? id,
      provider: id.split("/")[0] ?? "unknown",
      pricingPrompt: raw.pricing?.prompt ?? null,
      pricingCompletion: raw.pricing?.completion ?? null,
      pricingAudio: raw.pricing?.audio ?? null,
      contextLength: raw.context_length ?? null,
      inputModalities: input,
      outputModalities: output,
      supportedParameters: params,
      tools,
      structured,
      vision,
    });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

export function modelSupportsSlot(
  model: CatalogueModel,
  slot: "chat" | "transcription" | "speech",
): boolean {
  if (slot === "chat") {
    return (
      model.outputModalities.length === 0 ||
      model.outputModalities.includes("text")
    );
  }
  if (slot === "transcription") {
    return (
      model.outputModalities.includes("transcription") ||
      model.id.toLowerCase().includes("whisper") ||
      model.id.toLowerCase().includes("transcribe")
    );
  }
  return (
    model.outputModalities.includes("speech") ||
    model.id.toLowerCase().includes("tts") ||
    model.id.toLowerCase().includes("kokoro")
  );
}
