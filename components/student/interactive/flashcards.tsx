"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import type { InteractiveProps } from "./types";

/** Flashcard stack: each card flips between question (key) and answer (value).
 *  Click the card OR the Flip button to flip; arrows move between cards. */
export function FlashcardsBlock({ data, onComplete }: InteractiveProps) {
  const cards = data.length > 0 ? data : [{ key: "No cards yet", value: "—" }];
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[i];

  const seen = useRef<Set<number>>(new Set([0]));
  const loggedRef = useRef(false);

  const markSeen = (idx: number) => {
    seen.current.add(idx);
    if (!loggedRef.current && seen.current.size >= cards.length) {
      loggedRef.current = true;
      onComplete?.({
        detail: `Reviewed all ${cards.length} flashcard${cards.length === 1 ? "" : "s"}`,
        completed: true,
      });
    }
  };

  const go = (dir: number) => {
    setFlipped(false);
    setI((p) => {
      const next = (p + dir + cards.length) % cards.length;
      markSeen(next);
      return next;
    });
  };

  const flip = () => setFlipped((f) => !f);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Flashcards · tap the card to flip</span>
        <span>{i + 1} / {cards.length}</span>
      </div>

      <div style={{ perspective: "1000px" }}>
        <button
          type="button"
          onClick={flip}
          aria-label={flipped ? "Show question" : "Show answer"}
          className="relative block min-h-[140px] w-full"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.5s ease",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Question face */}
          <div
            className="absolute inset-0 grid place-items-center rounded-xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 to-transparent p-6 text-center"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Question</p>
              <p className="mt-1 text-lg font-semibold text-white">{card.key}</p>
            </div>
          </div>
          {/* Answer face */}
          <div
            className="absolute inset-0 grid place-items-center rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent p-6 text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div>
              <p className="text-[11px] uppercase tracking-wide text-green-300/80">Answer</p>
              <p className="mt-1 text-lg font-semibold text-white">{card.value}</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white"
          aria-label="Previous card"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={flip}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
        >
          <Shuffle size={12} /> Flip
        </button>
        <button
          onClick={() => go(1)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white"
          aria-label="Next card"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
