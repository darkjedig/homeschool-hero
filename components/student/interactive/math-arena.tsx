"use client";

import { useEffect, useRef, useState } from "react";
import { Zap, Timer, Trophy, RefreshCw, Check, X, Play } from "lucide-react";

type Pair = { key: string; value: string };
type Mode = "add" | "sub" | "mul" | "div" | "mixed" | "fractions" | "percent";
type Q = { prompt: string; answer: number };

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion(mode: Mode, min: number, max: number): Q {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const m: Exclude<Mode, "mixed"> =
    mode === "mixed" ? pick(["add", "sub", "mul", "div"] as const) : mode;

  switch (m) {
    case "add": {
      const a = randInt(min, max);
      const b = randInt(min, max);
      return { prompt: `${a} + ${b}`, answer: a + b };
    }
    case "sub": {
      const a = randInt(min, max);
      const b = randInt(min, a);
      return { prompt: `${a} − ${b}`, answer: a - b };
    }
    case "mul": {
      const a = randInt(min, max);
      const b = randInt(min, max);
      return { prompt: `${a} × ${b}`, answer: a * b };
    }
    case "div": {
      const b = randInt(Math.max(2, min), max);
      const q = randInt(min, max);
      return { prompt: `${b * q} ÷ ${b}`, answer: q };
    }
    case "fractions": {
      const denom = pick([2, 3, 4, 5, 10]);
      const num = randInt(1, denom - 1);
      const whole = denom * randInt(2, Math.max(2, Math.floor(max / denom) || 4));
      return { prompt: `${num}/${denom} of ${whole}`, answer: (whole / denom) * num };
    }
    case "percent": {
      const pct = pick([10, 20, 25, 50, 75]);
      const whole = pick([20, 40, 60, 80, 100, 200]);
      return { prompt: `${pct}% of ${whole}`, answer: (whole * pct) / 100 };
    }
  }
}

/** Generative maths practice arena. Endless questions, scoring, optional timer. */
export function MathArenaBlock({ data }: { data: Pair[] }) {
  const get = (k: string) => data.find((d) => d.key === k)?.value ?? "";
  const title = get("title") || "Practice Arena";
  const mode = (get("mode") || "mixed") as Mode;
  const min = Number(get("min")) || 1;
  const max = Number(get("max")) || 12;
  const count = Number(get("count")) || 10;
  const seconds = Number(get("seconds")) || 0;

  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [q, setQ] = useState<Q | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<"none" | "right" | "wrong">("none");
  const [timeLeft, setTimeLeft] = useState(seconds);
  const inputRef = useRef<HTMLInputElement>(null);

  const start = () => {
    setScore(0);
    setStreak(0);
    setBest(0);
    setIndex(0);
    setValue("");
    setFeedback("none");
    setTimeLeft(seconds);
    setQ(makeQuestion(mode, min, max));
    setPhase("playing");
  };

  // Countdown timer (only when a time limit is set). setState happens inside the
  // async timeout callback (not synchronously in the effect body).
  useEffect(() => {
    if (phase !== "playing" || !seconds || timeLeft <= 0) return;
    const t = setTimeout(() => {
      if (timeLeft <= 1) setPhase("done");
      else setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, seconds]);

  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [phase, q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q || feedback !== "none") return;
    const correct = Number(value) === q.answer;
    setFeedback(correct ? "right" : "wrong");
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBest((b) => Math.max(b, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
    setTimeout(() => {
      const nextIndex = index + 1;
      if (nextIndex >= count) {
        setPhase("done");
        return;
      }
      setIndex(nextIndex);
      setQ(makeQuestion(mode, min, max));
      setValue("");
      setFeedback("none");
    }, 650);
  };

  if (phase === "idle") {
    return (
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent p-6 text-center">
        <Zap size={28} className="mx-auto mb-2 text-blue-300" />
        <p className="text-lg font-bold text-white">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {count} questions{seconds ? ` · ${seconds}s timer` : ""} · beat your streak!
        </p>
        <button
          type="button"
          onClick={start}
          className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-blue-400"
        >
          <Play size={16} /> Start
        </button>
      </div>
    );
  }

  if (phase === "done") {
    const pct = Math.round((score / count) * 100);
    return (
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent p-6 text-center">
        <Trophy size={28} className="mx-auto mb-2 text-yellow-400" />
        <p className="text-lg font-bold text-white">
          {score} / {count} correct ({pct}%)
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Best streak: {best} in a row</p>
        <button
          type="button"
          onClick={start}
          className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
        >
          <RefreshCw size={15} /> Play again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent p-6">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-semibold text-white">
          Question {index + 1} / {count}
        </span>
        <span className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1 text-orange-300">
            <Zap size={13} /> {streak}
          </span>
          {seconds > 0 && (
            <span className="flex items-center gap-1 font-mono text-blue-200">
              <Timer size={13} /> {timeLeft}s
            </span>
          )}
        </span>
      </div>

      <p className="mb-4 text-center text-4xl font-bold tracking-wide text-white">
        {q?.prompt} <span className="text-blue-400">=</span>
      </p>

      <form onSubmit={submit} className="flex items-center justify-center gap-2">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={feedback !== "none"}
          className={
            "w-32 rounded-xl border bg-black/40 px-4 py-3 text-center text-2xl font-bold text-white outline-none transition " +
            (feedback === "right"
              ? "border-green-500/60"
              : feedback === "wrong"
                ? "border-red-500/60"
                : "border-white/15 focus:border-blue-400/60")
          }
          placeholder="?"
        />
        <button
          type="submit"
          disabled={feedback !== "none" || value === ""}
          className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-40"
        >
          Go
        </button>
      </form>

      <div className="mt-3 h-6 text-center text-sm font-semibold">
        {feedback === "right" && (
          <span className="flex items-center justify-center gap-1 text-green-400">
            <Check size={15} /> Correct!
          </span>
        )}
        {feedback === "wrong" && (
          <span className="flex items-center justify-center gap-1 text-orange-400">
            <X size={15} /> Answer: {q?.answer}
          </span>
        )}
      </div>
    </div>
  );
}
