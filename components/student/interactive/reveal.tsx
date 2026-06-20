"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";

type Pair = { key: string; value: string };

/** Tap-to-reveal: a prompt that hides an answer until tapped. */
export function RevealBlock({ data }: { data: Pair[] }) {
  const prompt = data.find((d) => d.key === "prompt")?.value ?? "Tap to reveal";
  const answer = data.find((d) => d.key === "answer")?.value ?? "";
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.06] p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-white">
        <Lightbulb size={16} className="text-yellow-300" /> {prompt}
      </p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-3 flex items-center gap-1 rounded-lg bg-yellow-400/15 px-3 py-1.5 text-xs font-semibold text-yellow-200 hover:bg-yellow-400/25"
      >
        {open ? "Hide" : "Reveal"}
        <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open && (
        <p className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-slate-200">
          {answer}
        </p>
      )}
    </div>
  );
}
