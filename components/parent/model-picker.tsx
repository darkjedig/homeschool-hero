"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type ModelChoice = {
  id: string;
  name: string;
  provider: string;
  pricingPrompt: string | null;
  pricingCompletion: string | null;
  pricingAudio: string | null;
  tools?: boolean;
};

function perMillion(raw: string | null): string | null {
  if (raw == null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n === 0) return "Free";
  const perM = n * 1_000_000;
  if (perM >= 1000) return `$${perM.toFixed(0)}/M`;
  if (perM >= 1) return `$${perM.toFixed(2)}/M`;
  return `$${perM.toPrecision(2)}/M`;
}

function audioPrice(raw: string | null): string | null {
  if (raw == null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n === 0) return "Free";
  if (n < 0.01) return `$${n.toPrecision(2)}/s`;
  return `$${n.toFixed(2)}`;
}

export function ModelPicker({
  label,
  value,
  onChange,
  models,
  loading,
  modality,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  models: ModelChoice[];
  loading: boolean;
  modality: "chat" | "transcription" | "speech";
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = needle
      ? models.filter(
          (m) =>
            m.id.toLowerCase().includes(needle) ||
            m.name.toLowerCase().includes(needle) ||
            m.provider.toLowerCase().includes(needle),
        )
      : models;
    return rows.slice(0, 80);
  }, [models, query]);

  const selected = models.find((m) => m.id === value);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-white">{label}</p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
      >
        {value && !selected && <option value={value}>{value}</option>}
        {filtered.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={loading ? "Loading models…" : "Search catalogue"}
          className="pl-8"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {selected ? (
          <>
            <span className="font-mono text-slate-300">{selected.id}</span>
            {modality === "chat" && selected.pricingPrompt && (
              <> · in {perMillion(selected.pricingPrompt)} · out {perMillion(selected.pricingCompletion)}</>
            )}
            {modality !== "chat" && selected.pricingAudio && <> · {audioPrice(selected.pricingAudio)}</>}
            {modality === "chat" && selected.tools === false && <> · no tools</>}
          </>
        ) : (
          value
        )}
      </p>
    </div>
  );
}
