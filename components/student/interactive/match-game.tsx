"use client";

import { useMemo, useState } from "react";
import { Link2, CheckCircle2, RefreshCw } from "lucide-react";

type Pair = { key: string; value: string };

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

/** Two-column matching game: tap a term, then its definition. */
export function MatchGameBlock({ data }: { data: Pair[] }) {
  const pairs = data.length > 0 ? data : [{ key: "—", value: "—" }];
  const terms = useMemo(
    () => seededShuffle(pairs, hashSeed(pairs.map((p) => p.key).join("|"))),
    [pairs],
  );
  const defs = useMemo(
    () => seededShuffle(pairs, hashSeed(pairs.map((p) => p.value).join("|") + "d")),
    [pairs],
  );

  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const allMatched = matched.size === pairs.length;

  const pickDef = (defKey: string) => {
    if (!selTerm || matched.has(defKey)) return;
    setAttempts((a) => a + 1);
    if (defKey === selTerm) {
      setMatched((prev) => new Set(prev).add(defKey));
      setSelTerm(null);
    } else {
      setWrong(defKey);
      setTimeout(() => setWrong(null), 500);
      setSelTerm(null);
    }
  };

  const reset = () => {
    setMatched(new Set());
    setSelTerm(null);
    setWrong(null);
    setAttempts(0);
  };

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-purple-500/[0.05] p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <Link2 size={16} className="text-purple-300" /> Match the pairs
        </p>
        <span className="text-xs text-muted-foreground">
          {matched.size} / {pairs.length}
        </span>
      </div>

      {allMatched ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
          <CheckCircle2 size={24} className="mx-auto mb-1 text-green-400" />
          <p className="text-sm font-semibold text-white">All matched in {attempts} tries!</p>
          <button
            type="button"
            onClick={reset}
            className="mx-auto mt-3 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <RefreshCw size={14} /> Play again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {terms.map((t) => {
              const done = matched.has(t.key);
              const active = selTerm === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  disabled={done}
                  onClick={() => setSelTerm(t.key)}
                  className={
                    "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition " +
                    (done
                      ? "border-green-500/40 bg-green-500/10 text-muted-foreground line-through"
                      : active
                        ? "border-purple-400/70 bg-purple-500/20 text-white"
                        : "border-white/10 bg-white/5 text-white hover:border-purple-400/40")
                  }
                >
                  {t.key}
                </button>
              );
            })}
          </div>
          <div className="space-y-2">
            {defs.map((d) => {
              const done = matched.has(d.key);
              const isWrong = wrong === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  disabled={done || !selTerm}
                  onClick={() => pickDef(d.key)}
                  className={
                    "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition " +
                    (done
                      ? "border-green-500/40 bg-green-500/10 text-muted-foreground"
                      : isWrong
                        ? "border-red-500/60 bg-red-500/15 text-white"
                        : "border-white/10 bg-white/5 text-white enabled:hover:border-purple-400/40 disabled:opacity-50")
                  }
                >
                  {d.value}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
