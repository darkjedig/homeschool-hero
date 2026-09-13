"use client";

import { useEffect, useRef, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CosmoAvatar } from "@/components/shared/cosmo-avatar";
import { TEACHER_NAME } from "@/lib/teacher-name";
import { TEACHER_PRESETS, voicesForModel, resolveVoiceForModel, type TeacherPresetId, type TeacherVoice } from "@/convex/lib/aiPresets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Volume2 } from "lucide-react";
import { ModelPicker, type ModelChoice } from "./model-picker";

export function AiTeacherSettings() {
  const saved = useQuery(api.settings.getTeacherSettings);
  const listModels = useAction(api.teacher.listModels);
  const saveConfig = useAction(api.teacher.saveTeacherConfig);
  const previewSpeech = useAction(api.teacher.previewSpeech);

  const [enabled, setEnabled] = useState(true);
  const [voiceInput, setVoiceInput] = useState(true);
  const [spoken, setSpoken] = useState(true);
  const [chatModel, setChatModel] = useState("");
  const [fallbackModel, setFallbackModel] = useState("");
  const [sttModel, setSttModel] = useState("");
  const [ttsModel, setTtsModel] = useState("");
  const [voice, setVoice] = useState("");
  const [maxTokens, setMaxTokens] = useState(400);
  const [dailyCap, setDailyCap] = useState(200);
  const [preset, setPreset] = useState<TeacherPresetId | "custom">("recommended");
  const [advanced, setAdvanced] = useState(false);
  const [chatModels, setChatModels] = useState<ModelChoice[]>([]);
  const [sttModels, setSttModels] = useState<ModelChoice[]>([]);
  const [ttsModels, setTtsModels] = useState<ModelChoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!saved) return;
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate form once Convex settings arrive */
    setEnabled(saved.teacherEnabled);
    setVoiceInput(saved.voiceInputEnabled);
    setSpoken(saved.spokenRepliesEnabled);
    setChatModel(saved.teacherChatModel);
    setFallbackModel(saved.teacherFallbackModel);
    setSttModel(saved.speechToTextModel);
    setTtsModel(saved.textToSpeechModel);
    setVoice(saved.ttsVoice);
    setMaxTokens(saved.maxResponseTokens);
    setDailyCap(saved.dailyRequestCap);
    const match = TEACHER_PRESETS.find(
      (p) =>
        p.teacherChatModel === saved.teacherChatModel &&
        p.teacherFallbackModel === saved.teacherFallbackModel &&
        p.speechToTextModel === saved.speechToTextModel &&
        p.textToSpeechModel === saved.textToSpeechModel,
    );
    setPreset(match?.id ?? "custom");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [saved]);

  const load = async (refresh = false) => {
    setLoading(true);
    setError("");
    try {
      const [chat, transcription, speech] = await Promise.all([
        listModels({ modality: "chat", refresh }),
        listModels({ modality: "transcription", refresh }),
        listModels({ modality: "speech", refresh }),
      ]);
      setChatModels(chat);
      setSttModels(transcription);
      setTtsModels(speech);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load models.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!saved?.keyIsSet) return;
    const id = window.setTimeout(() => {
      void load(false);
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.keyIsSet]);

  const applyPreset = (id: TeacherPresetId) => {
    const next = TEACHER_PRESETS.find((p) => p.id === id);
    if (!next) return;
    setPreset(id);
    setChatModel(next.teacherChatModel);
    setFallbackModel(next.teacherFallbackModel);
    setSttModel(next.speechToTextModel);
    setTtsModel(next.textToSpeechModel);
    setVoice(next.ttsVoice);
  };

  const markCustom = () => setPreset("custom");

  const voiceOptions = voicesForModel(ttsModel);
  const voiceGroups: Array<{ label: string; voices: TeacherVoice[] }> = [
    { label: "Kokoro", voices: voiceOptions.filter((row) => row.engine === "kokoro") },
    { label: "Gemini", voices: voiceOptions.filter((row) => row.engine === "gemini") },
  ].filter((group) => group.voices.length > 0);

  const playPreview = async () => {
    if (!voice || !ttsModel) return;
    setPreviewing(true);
    setError("");
    setMessage("");
    previewAudioRef.current?.pause();
    previewAudioRef.current = null;
    try {
      const result = await previewSpeech({
        textToSpeechModel: ttsModel,
        ttsVoice: voice,
      });
      if (!result.audioBase64) {
        setError(result.error ?? "Could not play that voice.");
        return;
      }
      const audio = new Audio(`data:audio/mpeg;base64,${result.audioBase64}`);
      previewAudioRef.current = audio;
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play that voice.");
    } finally {
      setPreviewing(false);
    }
  };

  const onSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await saveConfig({
        teacherEnabled: enabled,
        teacherChatModel: chatModel,
        teacherFallbackModel: fallbackModel,
        speechToTextModel: sttModel,
        textToSpeechModel: ttsModel,
        ttsVoice: voice,
        voiceInputEnabled: voiceInput,
        spokenRepliesEnabled: spoken,
        maxResponseTokens: maxTokens,
        dailyRequestCap: dailyCap,
      });
      if (!result.ok) {
        setError(result.error ?? "Could not save Cosmo settings.");
      } else {
        setMessage("Cosmo settings saved.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save Cosmo settings.");
    } finally {
      setSaving(false);
    }
  };

  if (saved === undefined) {
    return <div className="h-40 animate-pulse rounded-2xl bg-white/5" />;
  }

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <header className="flex items-start gap-3">
        <CosmoAvatar className="h-12 w-12 shrink-0" />
        <div>
          <h2 className="text-lg font-semibold text-white">{TEACHER_NAME} (AI Teacher)</h2>
          <p className="text-sm text-muted-foreground">
            Hudson can type or talk. {TEACHER_NAME} answers in text and out loud, using the same OpenRouter key as the lesson builder.
          </p>
        </div>
      </header>

      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4" />
        <div>
          <p className="text-sm font-medium text-white">Enable {TEACHER_NAME}</p>
          <p className="text-xs text-muted-foreground">Shows the robot on student pages.</p>
        </div>
      </label>
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <input type="checkbox" checked={voiceInput} onChange={(e) => setVoiceInput(e.target.checked)} className="h-4 w-4" />
        <div>
          <p className="text-sm font-medium text-white">Voice input</p>
          <p className="text-xs text-muted-foreground">Press the mic to talk to {TEACHER_NAME}. Audio is not stored.</p>
        </div>
      </label>
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <input type="checkbox" checked={spoken} onChange={(e) => setSpoken(e.target.checked)} className="h-4 w-4" />
        <div>
          <p className="text-sm font-medium text-white">Spoken replies</p>
          <p className="text-xs text-muted-foreground">
            On by default. {TEACHER_NAME} reads answers in a calm teacher voice. Hudson can mute in the panel.
          </p>
        </div>
      </label>

      <div>
        <p className="mb-2 text-sm font-semibold text-white">Preset</p>
        <div className="flex flex-wrap gap-2">
          {TEACHER_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={
                "rounded-full border px-3 py-1.5 text-xs " +
                (preset === p.id
                  ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-100"
                  : "border-white/10 bg-black/20 text-muted-foreground hover:text-white")
              }
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={markCustom}
            className={
              "rounded-full border px-3 py-1.5 text-xs " +
              (preset === "custom"
                ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-100"
                : "border-white/10 bg-black/20 text-muted-foreground hover:text-white")
            }
          >
            Custom
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {TEACHER_PRESETS.find((p) => p.id === preset)?.description ?? "Pick models yourself from the catalogue."}
        </p>
      </div>

      <ModelPicker
        label="Teacher chat model"
        value={chatModel}
        onChange={(id) => {
          markCustom();
          setChatModel(id);
        }}
        models={chatModels}
        loading={loading}
        modality="chat"
      />
      <ModelPicker
        label="Speech-to-text"
        value={sttModel}
        onChange={(id) => {
          markCustom();
          setSttModel(id);
        }}
        models={sttModels}
        loading={loading}
        modality="transcription"
      />
      <ModelPicker
        label="Text-to-speech"
        value={ttsModel}
        onChange={(id) => {
          markCustom();
          setTtsModel(id);
          setVoice(resolveVoiceForModel(id, voice));
        }}
        models={ttsModels}
        loading={loading}
        modality="speech"
      />

      <div>
        <Label className="mb-2 block text-sm font-semibold text-white">Voice</Label>
        <div className="flex gap-2">
          <select
            value={voice}
            onChange={(e) => {
              markCustom();
              setVoice(e.target.value);
            }}
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
          >
            {voiceGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label} — {v.hint}
                  </option>
                ))}
              </optgroup>
            ))}
            {voice && !voiceOptions.some((v) => v.id === voice) && (
              <option value={voice}>{voice}</option>
            )}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={() => void playPreview()}
            disabled={previewing || !voice || !saved.keyIsSet}
            aria-label="Preview voice"
            className="shrink-0"
          >
            {previewing ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
            Preview
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          OpenRouter no longer offers OpenAI speech. Recommended voices are Kokoro (Emma, George, and
          the others should sound different). Higher quality uses Gemini. Preview two voices, then
          save, before Hudson hears the change.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className="text-xs text-cyan-300 hover:underline"
      >
        {advanced ? "Hide advanced" : "Advanced"}
      </button>
      {advanced && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <ModelPicker
            label="Fallback chat model"
            value={fallbackModel}
            onChange={(id) => {
              markCustom();
              setFallbackModel(id);
            }}
            models={chatModels}
            loading={loading}
            modality="chat"
          />
          <div>
            <Label className="mb-2 block text-sm font-semibold text-white">Max response tokens</Label>
            <Input
              type="number"
              min={64}
              max={800}
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-semibold text-white">Daily request cap (saved for later)</Label>
            <Input
              type="number"
              min={10}
              max={2000}
              value={dailyCap}
              onChange={(e) => setDailyCap(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Stored now. A usage counter is not written in this version.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-muted-foreground">
        Chat asks OpenRouter for zero-data-retention (ZDR) providers when available. Speech models
        such as Whisper and Kokoro may run on hosts that only keep audio for the length of the
        request — ZDR is not guaranteed for every cheap speech endpoint. We do not store Cosmo
        chats or recordings. Do not send addresses, PINs, or other family secrets.
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void onSave()} disabled={saving} className="bg-blue-500 text-white hover:bg-blue-400">
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          Save {TEACHER_NAME} settings
        </Button>
        <Button variant="outline" onClick={() => void load(true)} disabled={loading || !saved.keyIsSet}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh models
        </Button>
        {message && <span className="self-center text-sm text-green-400">{message}</span>}
      </div>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </section>
  );
}
