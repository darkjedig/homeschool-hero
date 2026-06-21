"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SubjectIcon } from "@/components/shared/subject-icon";
import { subjectMeta, hexToRgb } from "@/lib/subjects";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { PlayCircle, Star, Clock, ChevronRight } from "lucide-react";

export default function SubjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const subject = useQuery(api.subjects.bySlug, { slug });
  const topics = useQuery(
    api.topics.listBySubject,
    subject ? { subjectId: subject._id } : "skip",
  );
  const lessons = useQuery(
    api.lessons.listPublishedBySubject,
    subject ? { subjectId: subject._id } : "skip",
  );

  if (subject === undefined || topics === undefined || lessons === undefined) {
    return <SkeletonRow />;
  }
  if (subject === null) notFound();

  const meta = subjectMeta(subject.slug);
  const rgb = hexToRgb(subject.color || meta.color);
  const accent = subject.color || meta.color;
  const lessonsByTopic = new Map<string, typeof lessons>();
  for (const l of lessons) {
    const arr = lessonsByTopic.get(l.topicId) ?? [];
    arr.push(l);
    lessonsByTopic.set(l.topicId, arr);
  }
  const totalLessons = lessons.length;

  return (
    <div>
      <header
        className="mb-6 rounded-3xl border bg-gradient-to-br from-white/[0.07] to-transparent p-6"
        style={{ borderColor: `${accent}40`, boxShadow: `0 0 30px rgba(${rgb},0.15)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ backgroundColor: `${accent}22` }}
          >
            <SubjectIcon slug={subject.slug} iconName={subject.icon} color={subject.color} size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{subject.name}</h1>
            <p className="text-sm text-muted-foreground">{subject.description}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {topics.length} topics · {totalLessons} lessons
        </p>
      </header>

      <div className="space-y-6">
        {topics.map((t) => {
          const tLessons = lessonsByTopic.get(t._id) ?? [];
          return (
            <section key={t._id}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{t.name}</h2>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                  {t.difficultyLevel}
                </span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">{t.description}</p>

              {tLessons.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
                  No lessons in this topic yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {tLessons.map((l) => (
                    <Link
                      key={l._id}
                      href={`/lessons/${l._id}`}
                      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/20"
                      style={{ boxShadow: `0 0 16px rgba(${rgb},0.06)` }}
                    >
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                        style={{ backgroundColor: `${accent}22` }}
                      >
                        <PlayCircle size={20} style={{ color: accent }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">{l.title}</p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {l.estimatedMinutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-400" /> {l.pointsAwarded} pts
                          </span>
                          <span className="uppercase">{l.difficultyLevel}</span>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-white"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {topics.length === 0 && (
          <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-muted-foreground">
            This subject has no topics yet.
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
