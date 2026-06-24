"use client";

import { useMemo, useState } from "react";
import { PenLine, RefreshCw, Check } from "lucide-react";
import type { InteractiveProps } from "./types";

type Token = { id: number; word: string };

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h || 1;
}
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Fill-in-the-blank (cloze). data: key = sentence with "___", value = answer.
 * Tap a blank to select it, then tap a word from the bank to drop it in.
 */
export function FillBlankBlock({ data, onComplete }: InteractiveProps) {
  const items = data.length > 0 ? data : [{ key: "The ___ is blue.", value: "sky" }];
  const answers = useMemo(() => items.map((i) => i.value), [items]);
  const bank = useMemo<Token[]>(
    () =>
      seededShuffle(
        answers.map((word, id) => ({ id, word })),
        hashSeed(answers.join("|")),
      ),
    [answers],
  );

  const [filled, setFilled] = useState<(number | null)[]>(() => items.map(() => null));
  const [active, setActive] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const usedIds = new Set(filled.filter((f): f is number => f !== null));
  const wordById = (id: number) => bank.find((t) => t.id === id)?.word ?? "";

  const placeWord = (tokenId: number) => {
    if (active === null || checked) return;
    setFilled((prev) => {
      const next = [...prev];
      next[active] = tokenId;
      return next;
    });
    setActive(null);
  };

  const clearBlank = (i: number) => {
    if (checked) return;
    if (filled[i] !== null) {
      setFilled((prev) => {
        const next = [...prev];
        next[i] = null;
        return next;
      });
      setActive(i);
    } else {
      setActive(i);
    }
  };

  const reset = () => {
    setFilled(items.map(() => null));
    setActive(null);
    setChecked(false);
  };

  const allFilled = filled.every((f) => f !== null);
  const correctCount = filled.filter(
    (f, i) => f !== null && wordById(f) === answers[i],
  ).length;

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-purple-500/[0.05] p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <PenLine size={16} className="text-purple-300" /> Fill in the blanks
      </p>

      <div className="space-y-2.5">
        {items.map((item, i) => {
          const [before, after] = item.key.split("___");
          const word = filled[i] !== null ? wordById(filled[i] as number) : null;
          const isCorrect = checked && word === answers[i];
          const isWrong = checked && word !== null && word !== answers[i];
          let slotCls = "border-white/20 bg-white/5 text-muted-foreground";
          if (word) slotCls = "border-purple-400/50 bg-purple-500/15 text-white";
          if (active === i && !checked) slotCls = "border-purple-400 bg-purple-500/25 text-white";
          if (isCorrect) slotCls = "border-green-500/60 bg-green-500/15 text-white";
          if (isWrong) slotCls = "border-red-500/60 bg-red-500/15 text-white";
          return (
            <p key={i} className="text-sm leading-relaxed text-slate-200">
              {before}
              <button
                type="button"
                onClick={() => clearBlank(i)}
                className={"mx-1 inline-block min-w-[64px] rounded-lg border px-2 py-0.5 text-center text-sm transition " + slotCls}
              >
                {word ?? (checked ? answers[i] : "____")}
              </button>
              {after}
            </p>
          );
        })}
      </div>

      {/* Word bank */}
      {!checked && (
        <div className="mt-4 flex flex-wrap gap-2">
          {bank.map((t) => {
            const used = usedIds.has(t.id);
            return (
              <button
                key={t.id}
                type="button"
                disabled={used}
                onClick={() => placeWord(t.id)}
                className={
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition " +
                  (used
                    ? "border-white/5 bg-white/5 text-muted-foreground opacity-40"
                    : "border-purple-400/30 bg-white/5 text-white hover:border-purple-400/60")
                }
              >
                {t.word}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        {!checked ? (
          <button
            type="button"
            onClick={() => {
              setChecked(true);
              onComplete?.({
                score: correctCount,
                total: items.length,
                detail: `Filled ${correctCount}/${items.length} blanks correctly`,
                completed: true,
              });
            }}
            disabled={!allFilled}
            className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-400 disabled:opacity-40"
          >
            <Check size={14} className="mr-1 inline" /> Check answers
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <RefreshCw size={14} /> Try again
          </button>
        )}
        {checked && (
          <span className={"text-sm font-semibold " + (correctCount === items.length ? "text-green-400" : "text-orange-400")}>
            {correctCount} / {items.length} correct
          </span>
        )}
      </div>
    </div>
  );
}
