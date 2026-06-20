"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { ListChecks, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { hexToRgb } from "@/lib/subjects";

type QuizRow = {
  _id: string;
  title: string;
  lessonId: string;
  lessonTitle: string;
  subjectName: string;
  subjectColor: string;
  questionCount: number;
  attemptsCount: number;
  latestPercentage: number | null;
  bestPercentage: number | null;
  createdAt: number;
};

export default function QuizzesPage() {
  const quizzes = useQuery(api.quizzes.listAll);

  // Group by subject.
  const groups = new Map<string, { name: string; color: string; rows: QuizRow[] }>();
  for (const q of quizzes ?? []) {
    const g = groups.get(q.subjectName) ?? { name: q.subjectName, color: q.subjectColor, rows: [] };
    g.rows.push(q as QuizRow);
    groups.set(q.subjectName, g);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Quizzes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every lesson&apos;s quiz, grouped by subject. Click a lesson to edit its questions.
        </p>
      </header>

      {quizzes !== undefined && quizzes.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
          No quizzes yet. Quizzes are created with lessons, or add one from a lesson&apos;s editor.
        </p>
      )}

      <div className="space-y-6">
        {[...groups.values()].map((g) => {
          const rgb = hexToRgb(g.color);
          return (
            <section key={g.name}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-4 w-1 rounded-full"
                  style={{ backgroundColor: g.color, boxShadow: `0 0 10px ${g.color}` }}
                />
                <h2 className="text-base font-semibold text-white">{g.name}</h2>
                <span className="text-xs text-muted-foreground">{g.rows.length} quizzes</span>
              </div>
              <div
                className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                style={{ boxShadow: `0 0 20px rgba(${rgb},0.06)` }}
              >
                {g.rows.map((q) => (
                  <Link
                    key={q._id}
                    href={`/parent/lessons/${q.lessonId}`}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2.5 transition hover:border-white/20"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: `${g.color}22` }}>
                      <ListChecks size={18} style={{ color: g.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{q.lessonTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.questionCount} question{q.questionCount === 1 ? "" : "s"}
                        {q.attemptsCount > 0 && (
                          <span className="ml-2">· taken {q.attemptsCount}×</span>
                        )}
                      </p>
                    </div>
                    {q.bestPercentage !== null ? (
                      <Badge className={q.bestPercentage >= 60 ? "bg-green-500/20 text-green-300" : "bg-orange-500/20 text-orange-300"}>
                        Best: {q.bestPercentage}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not taken</Badge>
                    )}
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
