"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { SubjectIcon } from "@/components/shared/subject-icon";
import { hexToRgb } from "@/lib/subjects";
import { StaggerGroup, StaggerItem } from "@/components/shared/motion";

type SubjectCard = {
  _id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  total: number;
  taken: number;
  best: number | null;
};

export default function QuizIndex() {
  const subjects = useQuery(api.quizzes.subjectCards);
  const cards = (subjects ?? []) as SubjectCard[];

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/15 via-blue-600/10 to-transparent p-6 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.12)]">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/20">
            <Sparkles size={20} className="text-purple-300" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">Quizzes</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Pick a subject to jump in. Finish a lesson, then beat its quiz to earn points.
            </p>
          </div>
        </div>
      </header>

      {subjects !== undefined && cards.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
          No quizzes yet. Quizzes unlock as your lessons are published.
        </p>
      )}

      <StaggerGroup className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((s) => {
          const rgb = hexToRgb(s.color);
          const ready = s.total > 0;
          const progress = s.total > 0 ? Math.round((s.taken / s.total) * 100) : 0;
          return (
            <StaggerItem key={s._id} className="h-full">
              <Link
                href={`/subjects/${s.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-b from-white/[0.07] to-transparent p-4 backdrop-blur-md transition duration-200 hover:-translate-y-1 hover:scale-[1.02]"
                style={{
                  borderColor: `${s.color}40`,
                  boxShadow: `0 0 24px rgba(${rgb},0.12)`,
                }}
              >
                <span
                  className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-40 blur-2xl transition group-hover:opacity-70"
                  style={{ backgroundColor: s.color }}
                />
                <div
                  className="mb-3 grid h-12 w-12 place-items-center rounded-xl"
                  style={{ backgroundColor: `${s.color}22`, boxShadow: `0 0 16px ${s.color}55` }}
                >
                  <SubjectIcon slug={s.slug} iconName={s.icon} color={s.color} size={24} />
                </div>

                <p className="text-sm font-semibold text-white">{s.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {s.total} quiz{s.total === 1 ? "" : "zes"}
                </p>

                <div className="mt-auto pt-3">
                  {ready ? (
                    <>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: s.color,
                            boxShadow: `0 0 8px ${s.color}`,
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          {s.taken}/{s.total} done
                        </span>
                        {s.best !== null && (
                          <span
                            className={
                              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold " +
                              (s.best >= 60
                                ? "bg-green-500/15 text-green-300"
                                : "bg-orange-500/15 text-orange-300")
                            }
                          >
                            Best {s.best}%
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Coming soon</span>
                  )}
                </div>

                <span
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold opacity-0 transition group-hover:opacity-100"
                  style={{ color: s.color }}
                >
                  {ready ? "Start" : "Explore"} <ArrowRight size={12} />
                </span>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      {subjects === undefined && (
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
