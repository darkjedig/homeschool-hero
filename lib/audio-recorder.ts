const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"] as const;
const MAX_RECORDING_MS = 30_000;
const MAX_AUDIO_BYTES = Math.floor(1.5 * 1024 * 1024);
const SPEECH_RMS = 0.028;
const SILENCE_MS = 1200;
const MIN_SPEECH_MS = 400;
const IGNORE_START_MS = 280;
const POLL_MS = 80;

export type AudioFormat = "webm" | "mp4" | "wav";

export type RecordingResult = {
  base64: string;
  format: AudioFormat;
};

export class VoiceCancelled extends Error {
  constructor() {
    super("cancelled");
    this.name = "VoiceCancelled";
  }
}

export function isVoiceCancelled(error: unknown): boolean {
  return error instanceof VoiceCancelled || (error instanceof Error && error.name === "VoiceCancelled");
}

export type VoiceTurn = {
  cancel: () => void;
  result: Promise<RecordingResult>;
};

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function formatFromMime(mime: string): AudioFormat {
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("wav")) return "wav";
  return "webm";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the recording."));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read the recording."));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

function rmsFromTimeDomain(data: Float32Array): number {
  let sum = 0;
  for (const sample of data) {
    sum += sample * sample;
  }
  return Math.sqrt(sum / data.length);
}

export function micErrorMessage(error: unknown): string {
  if (isVoiceCancelled(error)) return "";
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "I can’t hear you. You can type instead.";
  }
  if (name === "NotFoundError") {
    return "I can’t hear you. You can type instead.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "I can’t hear you. You can type instead.";
}

export async function startVoiceTurn(): Promise<VoiceTurn> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("I can’t hear you. You can type instead.");
  }
  const mime = pickMime();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = mime
    ? new MediaRecorder(stream, { mimeType: mime })
    : new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  const samples = new Float32Array(analyser.fftSize);

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pollId: ReturnType<typeof setInterval> | null = null;
  let settled = false;
  let resolveResult!: (value: RecordingResult) => void;
  let rejectResult!: (error: Error) => void;
  const result = new Promise<RecordingResult>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  const stopTracks = () => {
    for (const track of stream.getTracks()) track.stop();
  };

  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    if (pollId) clearInterval(pollId);
    pollId = null;
    source.disconnect();
    void audioCtx.close();
  };

  const encodeAndResolve = () => {
    recorder.onstop = () => {
      stopTracks();
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      if (blob.size > MAX_AUDIO_BYTES) {
        rejectResult(new Error("That recording was a bit long. Try a shorter question."));
        return;
      }
      blobToBase64(blob)
        .then((base64) =>
          resolveResult({
            base64,
            format: formatFromMime(recorder.mimeType || mime),
          }),
        )
        .catch((error: unknown) =>
          rejectResult(error instanceof Error ? error : new Error("Could not read the recording.")),
        );
    };
    if (recorder.state !== "inactive") recorder.stop();
    else {
      stopTracks();
      rejectResult(new Error("I didn’t catch that. Try again or type it."));
    }
  };

  const finish = () => {
    if (settled) return;
    settled = true;
    cleanup();
    encodeAndResolve();
  };

  const cancel = () => {
    if (settled) return;
    settled = true;
    cleanup();
    if (recorder.state !== "inactive") recorder.stop();
    stopTracks();
    rejectResult(new VoiceCancelled());
  };

  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  recorder.start(200);
  const startedAt = Date.now();
  let heardSpeech = false;
  let loudAccumMs = 0;
  let lastLoudAt = startedAt;

  pollId = setInterval(() => {
    if (settled) return;
    analyser.getFloatTimeDomainData(samples);
    const rms = rmsFromTimeDomain(samples);
    const now = Date.now();
    if (now - startedAt < IGNORE_START_MS) return;
    if (rms >= SPEECH_RMS) {
      loudAccumMs += POLL_MS;
      lastLoudAt = now;
      if (loudAccumMs >= MIN_SPEECH_MS) heardSpeech = true;
    } else if (heardSpeech && now - lastLoudAt >= SILENCE_MS) {
      finish();
    }
  }, POLL_MS);

  timeoutId = setTimeout(() => {
    finish();
  }, MAX_RECORDING_MS);

  return { cancel, result };
}
