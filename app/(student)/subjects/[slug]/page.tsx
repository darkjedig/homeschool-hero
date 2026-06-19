"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SubjectIcon } from "@/components/shared/subject-icon";
import { subjectMeta, hexToRgb } from "@/lib/subjects";
import { notFound, useParams } from "next/navigation";
import { CheckCircle2, ChevronRight, Circle, Lock } from "lucide-react";

export default function SubjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const subject = useQuery(api.subjects.bySlug, { slug });
  const topics = useQuery(
    api.topics.listBySubject,
    subject ? { subjectId: subject._id } : "skip",
  );

  if (subject === undefined || topics === undefined) {
    return <SkeletonRow />;
  }
  if (subject === null) notFound();

  const meta = subjectMeta(subject.slug);
  const rgb = hexToRgb(meta.color);

  return (
    <div>
      <header
        className="mb-6 rounded-3xl border bg-gradient-to-br from-white/[0.06] to-transparent p-6"
        style={{ borderColor: `${meta.color}40`, boxShadow: `0 0 30px rgba(${rgb},0.15)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ backgroundColor: `${meta.color}22` }}
          >
            <SubjectIcon slug={subject.slug} size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{subject.name}</h1>
            <p className="text-sm text-muted-foreground">{subject.description}</p>
          </div>
        </div>
      </header>

      <h2 className="mb-3 text-lg font-semibold text-white">Topics</h2>
      <div className="space-y-3">
        {topics.map((t, i) => {
          const done = i < 2;
          const inProgress = i === 2;
          return (
            <div
              key={t._id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
            >
              {done ? (
                <CheckCircle2 size={20} className="text-green-400" />
              ) : inProgress ? (
                <Circle size={20} className="text-blue-400" />
              ) : (
                <Lock size={18} className="text-muted-foreground" />
              )}
              <div className="mr-auto">
                <p className="font-semibold text-white">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                {t.difficultyLevel}
              </span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
          );
        })}
        {topics.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No topics yet — the parent can add lessons soon.
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
}
