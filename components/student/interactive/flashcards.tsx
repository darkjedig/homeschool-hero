"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

type Pair = { key: string; value: string };

/** Flashcard stack: each card flips between question (key) and answer (value). */
export function FlashcardsBlock({ data }: { data: Pair[] }) {
  const cards = data.length > 0 ? data : [{ key: "No cards", value: "—" }];
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[i];

  const go = (dir: number) => {
    setFlipped(false);
    setI((p) => (p + dir + cards.length) % cards.length);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Flashcards</span>
        <span>{i + 1} / {cards.length}</span>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="grid min-h-[120px] w-full place-items-center rounded-xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 to-transparent p-6 text-center transition hover:border-blue-400/40"
      >
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {flipped ? "Answer" : "Question"}
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {flipped ? card.value : card.key}
          </p>
        </div>
      </button>
      <div className="mt-3 flex items-center justify-between">
        <button onClick={() => go(-1)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => setFlipped(false)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white">
          <RotateCcw size={12} /> Flip
        </button>
        <button onClick={() => go(1)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
