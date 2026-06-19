"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Check,
  X,
  Trophy,
  RotateCcw,
  Star,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { subjectMeta } from "@/lib/subjects";
import Link from "next/link";

type Q = {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subjectId: string;
};

export default function FridayQuizPage() {
  const data = useQuery(api.fridayQuiz.getCurrent);
  const submit = useMutation(api.fridayQuiz.submitFriday);

  const [phase, setPhase] = useState<"intro" | "quiz" | "done">("intro");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedAnswer: string; correct: boolean; subjectId: string }[]
  >([]);
  const [result, setResult] = useState<{
    percentage: number;
    pointsEarned: number;
    correct: number;
    total: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (data === undefined) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // No challenge generated yet (cron runs Monday; or parent hasn't published content).
  if (data === null || data.questions.length === 0) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="max-w-md rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-600/15 to-transparent p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-purple-500/25 shadow-[0_0_24px_rgba(168,85,247,0.4)]">
            <Swords size={26} className="text-purple-300" />
          </div>
          <h1 className="text-xl font-bold text-white">No Friday Challenge yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This week&apos;s boss challenge appears automatically once lessons are
            published. The dashboard countdown shows when the next one drops.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { fridayQuiz, questions } = data;
  const q: Q = questions[current];

  // ---------- RESULTS ----------
  if (phase === "done" && result) {
    return (
      <Results
        result={result}
        answers={answers}
        onRetry={() => {
          setPhase("intro");
          setCurrent(0);
          setSelected(null);
          setRevealed(false);
          setAnswers([]);
          setResult(null);
        }}
      />
    );
  }

  // ---------- INTRO (boss-level start) ----------
  if (phase === "intro") {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="max-w-lg rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-700/30 via-purple-900/20 to-transparent p-8 text-center shadow-[0_0_40px_rgba(168,85,247,0.25)]"
        >
          <motion.div
            initial={{ rotate: -8 }}
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >
            <Swords size={40} className="text-purple-200" />
          </motion.div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            Friday Challenge · Boss Level
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{fridayQuiz.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {questions.length} questions pulled from this week&apos;s lessons.
            Every correct answer earns <span className="font-semibold text-purple-300">double points</span>.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-purple-200/80">
            <Sparkles size={14} /> {fridayQuiz.doublePoints ? "2× points active" : "points active"}
          </div>
          <button
            type="button"
            onClick={() => setPhase("quiz")}
            className="mt-7 w-full rounded-xl bg-purple-500 px-6 py-3.5 font-semibold text-white shadow-[0_0_24px_rgba(168,85,247,0.5)] transition hover:bg-purple-400"
          >
            Start the Challenge
          </button>
        </motion.div>
      </div>
    );
  }

  // ---------- QUIZ ----------
  const isLast = current === questions.length - 1;
  const progressPct = Math.round(((current + (revealed ? 1 : 0)) / questions.length) * 100);

  const choose = (opt: string) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
  };

  const next = async () => {
    const correct = selected === q.correctAnswer;
    const newAnswers = [
      ...answers,
      { questionId: q._id, selectedAnswer: selected ?? "", correct, subjectId: q.subjectId },
    ];
    setAnswers(newAnswers);
    setSelected(null);
    setRevealed(false);

    if (isLast) {
      setSubmitting(true);
      try {
        const res = await submit({
          fridayQuizId: fridayQuiz._id,
          answers: newAnswers.map((a) => ({
            questionId: a.questionId as never,
            selectedAnswer: a.selectedAnswer,
            correct: a.correct,
          })),
        });
        setResult(res);
        setPhase("done");
      } catch {
        setResult({
          percentage: 0,
          pointsEarned: 0,
          correct: newAnswers.filter((a) => a.correct).length,
          total: questions.length,
        });
        setPhase("done");
      } finally {
        setSubmitting(false);
      }
    } else {
      setCurrent((c) => c + 1);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wide text-purple-300">
            Friday Challenge
          </span>
          <span className="text-muted-foreground">
            {current + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progressPct} className="h-2 [&>div]:bg-purple-500" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-purple-500/20 bg-white/5 p-6 backdrop-blur-md"
        >
          <h2 className="mb-5 text-lg font-semibold text-white">{q.questionText}</h2>
          <div className="space-y-2.5">
            {q.options.map((opt) => {
              const isCorrect = opt === q.correctAnswer;
              const isSelected = opt === selected;
              let style =
                "border-white/10 bg-white/5 text-white hover:border-purple-400/40";
              if (revealed) {
                if (isCorrect) style = "border-green-500/50 bg-green-500/15 text-white";
                else if (isSelected) style = "border-red-500/50 bg-red-500/15 text-white";
                else style = "border-white/10 bg-white/5 text-muted-foreground";
              }
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={revealed}
                  onClick={() => choose(opt)}
                  className={"flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition " + style}
                >
                  <span className="mr-auto">{opt}</span>
                  {revealed && isCorrect && <Check size={16} className="text-green-400" />}
                  {revealed && isSelected && !isCorrect && <X size={16} className="text-red-400" />}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-sm text-purple-100">
              <span className="font-semibold text-white">
                {selected === q.correctAnswer ? "Nailed it! " : "Not quite. "}
              </span>
              {q.explanation}
            </div>
          )}

          {revealed && (
            <button
              type="button"
              onClick={next}
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] transition hover:bg-purple-400 disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {isLast ? "Reveal results" : "Next question"}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Results({
  result,
  answers,
  onRetry,
}: {
  result: { percentage: number; pointsEarned: number; correct: number; total: number };
  answers: { questionId: string; selectedAnswer: string; correct: boolean; subjectId: string }[];
  onRetry: () => void;
}) {
  // Strong / weak by subject.
  const bySubject = new Map<string, { correct: number; total: number }>();
  for (const a of answers) {
    const key = a.subjectId || "general";
    const e = bySubject.get(key) ?? { correct: 0, total: 0 };
    e.total += 1;
    if (a.correct) e.correct += 1;
    bySubject.set(key, e);
  }
  const subjectStats = [...bySubject.entries()].map(([sid, s]) => ({
    name: sid && sid !== "general" ? subjectMeta(sid).name : "General",
    color: sid && sid !== "general" ? subjectMeta(sid).color : "#a855f7",
    pct: s.total ? Math.round((s.correct / s.total) * 100) : 0,
  }));
  const weak = subjectStats.filter((s) => s.pct < 70);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-700/25 to-transparent p-8 text-center shadow-[0_0_36px_rgba(168,85,247,0.25)]"
      >
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-purple-500/25 shadow-[0_0_28px_rgba(168,85,247,0.5)]">
          <Trophy size={30} className="text-purple-200" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-purple-300">
          Challenge complete
        </p>
        <p className="mt-1 text-5xl font-bold text-white">{result.percentage}%</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {result.correct} of {result.total} correct
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-1.5 text-sm font-semibold text-purple-200">
          <Star size={16} fill="currentColor" /> +{result.pointsEarned} points (2×)
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
        >
          <RotateCcw size={16} /> Try again
        </button>
      </motion.div>

      {subjectStats.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-white">By subject</h3>
          <div className="space-y-3">
            {subjectStats.map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-white">{s.name}</span>
                  <span className="text-muted-foreground">{s.pct}%</span>
                </div>
                <Progress value={s.pct} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {weak.length > 0 && (
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
          <h3 className="mb-1 text-sm font-semibold text-white">Recommended review</h3>
          <p className="text-xs text-muted-foreground">
            Brush up on{" "}
            <span className="font-semibold text-orange-300">
              {weak.map((w) => w.name).join(", ")}
            </span>{" "}
            — your score there was under 70%. Revisit those lessons before next
            week&apos;s challenge.
          </p>
        </div>
      )}
    </div>
  );
}
