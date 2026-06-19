"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KeyRound, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const MODELS = [
  "openai/gpt-5.4-mini",
  "deepseek/deepseek-v4-flash",
  "xiaomi/mimo-v2.5",
  "deepseek/deepseek-v4-pro",
  "nex-agi/nex-n2-pro:free",
  "google/gemini-3.5-flash",
  "anthropic/claude-sonnet-4.6",
];

export default function ParentSettingsPage() {
  const config = useQuery(api.settings.getAiConfig);
  const save = useMutation(api.settings.saveAiConfig);
  const test = useAction(api.aiCourseBuilder.testConnection);

  const [keyInput, setKeyInput] = useState("");
  const [model, setModel] = useState("");
  const [youtube, setYoutube] = useState(false);
  const [customModel, setCustomModel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  // Sync defaults once config loads.
  const effectiveModel = model || config?.model || MODELS[0];
  const effectiveYoutube = config ? (youtube || config.youtubeSearchEnabled) : false;

  const doSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await save({
        openRouterKey: keyInput.trim() || undefined,
        openRouterModel: customModel ? model : effectiveModel,
        youtubeSearchEnabled: effectiveYoutube,
      });
      setKeyInput("");
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const doTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await test({}));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bring your own OpenRouter API key to power the AI lesson builder. The
          key is stored server-side and never sent to the browser.
        </p>
      </header>

      <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div>
          <Label className="mb-2 block text-sm font-semibold text-white">
            OpenRouter API key
          </Label>
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/15">
              <KeyRound size={18} className="text-blue-300" />
            </div>
            <Input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder={
                config?.keyIsSet
                  ? "•••••••• stored — paste a new key to replace"
                  : "sk-or-v1-…"
              }
              className="flex-1"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Get one at{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline"
            >
              openrouter.ai/keys
            </a>
            . {config?.keyIsSet ? "A key is currently stored." : "No key stored yet."}
          </p>
        </div>

        <div>
          <Label className="mb-2 block text-sm font-semibold text-white">Model</Label>
          {!customModel ? (
            <select
              value={effectiveModel}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="provider/model-name"
            />
          )}
          <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={customModel}
              onChange={(e) => {
                setCustomModel(e.target.checked);
                setModel("");
              }}
            />
            Use a custom model from the OpenRouter catalogue
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <input
            type="checkbox"
            checked={effectiveYoutube}
            onChange={(e) => setYoutube(e.target.checked)}
            className="h-4 w-4"
          />
          <div>
            <p className="text-sm font-medium text-white">YouTube search enabled</p>
            <p className="text-xs text-muted-foreground">
              Lets generated lessons include YouTube search links for you to confirm.
            </p>
          </div>
        </label>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={doSave}
            disabled={saving}
            className="bg-blue-500 text-white hover:bg-blue-400"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Save settings
          </Button>
          <Button
            variant="outline"
            onClick={doTest}
            disabled={testing || !config?.keyIsSet}
          >
            {testing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Test connection
          </Button>
          {saved && (
            <span className="self-center text-sm text-green-400">Saved ✓</span>
          )}
        </div>

        {testResult && (
          <div
            className={
              "flex items-start gap-2 rounded-xl border p-3 text-sm " +
              (testResult.ok
                ? "border-green-500/40 bg-green-500/10 text-green-300"
                : "border-red-500/40 bg-red-500/10 text-red-300")
            }
          >
            {testResult.ok ? <CheckCircle2 size={16} className="mt-0.5" /> : <XCircle size={16} className="mt-0.5" />}
            <span>{testResult.message}</span>
          </div>
        )}
      </section>
    </div>
  );
}
