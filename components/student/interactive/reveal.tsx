"use client";

import { useState } from "react";
import { Lightbulb, Check, X } from "lucide-react";

type Pair = { key: string; value: string };

/** Multiple-choice quick check (replaces tap-to-reveal so students can't
 *  just reveal the answer without thinking). Data encoded as {key,value} pairs:
 *  question, option_0..option_3, answer, explanation. */
export function RevealBlock({ data }: { data: Pair[] }) {
  const get = (k: string) => data.find((d) => d.key === k)?.value ?? "";
  const question = get("question") || get("prompt") || "Quick check";
  const answer = get("answer") || get("correct");
  const explanation = get("explanation") || get("explain") || "";

  // Gather options from option_0..option_3 (or fall back to legacy single answer).
  const options = [0, 1, 2, 3].map((i) => get(`option_${i}`)).filter(Boolean);
  const hasOptions = options.length >= 2;

  const [selected, setSelected] = useState<string | null>(null);
  const revealed = selected !== null;

  // Legacy format: only prompt + answer, no options → show as info card
  // (but this shouldn't happen for newly authored lessons).
  if (!hasOptions) {
    return (
      <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.06] p-5">
        <p className="text-sm font-semibold text-white">{question}</p>
        <p className="mt-2 rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-slate-200">
          {answer}
        </p>
        {explanation && <p className="mt-1 text-xs text-muted-foreground">{explanation}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.06] p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Lightbulb size={16} className="text-yellow-300" /> {question}
      </p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isCorrect = opt === answer;
          const isSelected = opt === selected;
          let cls = "border-white/10 bg-white/5 text-white hover:border-yellow-400/40";
          if (revealed) {
            if (isCorrect) cls = "border-green-500/50 bg-green-500/15 text-white";
            else if (isSelected) cls = "border-red-500/50 bg-red-500/15 text-white";
            else cls = "border-white/10 bg-white/5 text-muted-foreground";
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={revealed}
              onClick={() => setSelected(opt)}
              className={"flex w-full items-center gap-2 rounded-xl border px-4 py-2.5 text-left text-sm transition " + cls}
            >
              {revealed && isCorrect && <Check size={15} className="text-green-400" />}
              {revealed && isSelected && !isCorrect && <X size={15} className="text-red-400" />}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
          <p className={selected === answer ? "text-green-400" : "text-orange-300"}>
            {selected === answer ? "Correct! " : "Not quite. "}
          </p>
          {explanation && <p className="mt-1 text-muted-foreground">{explanation}</p>}
        </div>
      )}
    </div>
  );
}
