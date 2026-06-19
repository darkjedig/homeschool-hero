"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, notFound } from "next/navigation";
import { Check, X, Trophy, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Doc } from "@/convex/_generated/dataModel";

type Q = Doc<"quizQuestions">;

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const data = useQuery(api.quizzes.getWithQuestions, { quizId: id as never });
  const submit = useMutation(api.quizzes.submitAttempt);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedAnswer: string; correct: boolean }[]
  >([]);
  const [result, setResult] = useState<{
    percentage: number;
    pointsEarned: number;
  } | null>(null);

  if (data === undefined) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white/5" />;
  }
  if (data === null) notFound();

  const { quiz, questions } = data;

  if (result || questions.length === 0) {
    const correctCount = answers.filter((a) => a.correct).length;
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-yellow-400/20 shadow-[0_0_24px_rgba(234,179,8,0.4)]">
            <Trophy size={30} className="text-yellow-300" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {questions.length === 0 ? "No questions yet" : "Quiz complete!"}
          </h1>
          {result && (
            <>
              <p className="mt-2 text-4xl font-bold text-white">
                {result.percentage}%
              </p>
              <p className="text-sm text-muted-foreground">
                {correctCount} of {questions.length} correct ·{" "}
                <span className="text-yellow-300">
                  +{result.pointsEarned} pts
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setCurrent(0);
                  setSelected(null);
                  setRevealed(false);
                  setAnswers([]);
                  setResult(null);
                }}
                className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-blue-400"
              >
                <RotateCcw size={16} /> Try again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const q: Q = questions[current];
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
      { questionId: q._id, selectedAnswer: selected ?? "", correct },
    ];
    setAnswers(newAnswers);

    if (isLast) {
      try {
        const res = await submit({
          quizId: quiz._id,
          answers: newAnswers as never,
        });
        setResult(res);
      } catch {
        setResult({ percentage: 0, pointsEarned: 0 });
      }
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>{quiz.title}</span>
          <span>
            {current + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h1 className="mb-5 text-lg font-semibold text-white">
          {q.questionText}
        </h1>
        <div className="space-y-2.5">
          {q.options.map((opt) => {
            const isCorrect = opt === q.correctAnswer;
            const isSelected = opt === selected;
            let style =
              "border-white/10 bg-white/5 text-white hover:border-blue-400/40";
            if (revealed) {
              if (isCorrect) style = "border-green-500/50 bg-green-500/15 text-white";
              else if (isSelected)
                style = "border-red-500/50 bg-red-500/15 text-white";
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
                {revealed && isSelected && !isCorrect && (
                  <X size={16} className="text-red-400" />
                )}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-muted-foreground">
            <span className="font-semibold text-white">
              {selected === q.correctAnswer ? "Correct! " : "Not quite. "}
            </span>
            {q.explanation}
          </div>
        )}

        {revealed && (
          <button
            type="button"
            onClick={next}
            className="mt-5 w-full rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-blue-400"
          >
            {isLast ? "See results" : "Next question"}
          </button>
        )}
      </div>
    </div>
  );
}
