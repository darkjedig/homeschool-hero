"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SubjectIcon } from "@/components/shared/subject-icon";
import { subjectMeta, hexToRgb } from "@/lib/subjects";
import Link from "next/link";

export default function SubjectsIndex() {
  const subjects = useQuery(api.subjects.list);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Subjects</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(subjects ?? []).map((s) => {
          const meta = subjectMeta(s.slug);
          const rgb = hexToRgb(meta.color);
          return (
            <Link
              key={s._id}
              href={`/subjects/${s.slug}`}
              className="rounded-2xl border bg-gradient-to-b from-white/[0.06] to-transparent p-5 transition hover:-translate-y-0.5"
              style={{ borderColor: `${meta.color}40`, boxShadow: `0 0 22px rgba(${rgb},0.12)` }}
            >
              <div
                className="mb-3 grid h-12 w-12 place-items-center rounded-xl"
                style={{ backgroundColor: `${meta.color}22` }}
              >
                <SubjectIcon slug={s.slug} size={24} />
              </div>
              <p className="font-semibold text-white">{s.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
            </Link>
          );
        })}
        {subjects === undefined &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          ))}
      </div>
    </div>
  );
}
