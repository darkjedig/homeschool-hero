"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { subjectMeta, hexToRgb } from "@/lib/subjects";
import { AlertCircle } from "lucide-react";

/**
 * Adaptive "Recommended Review" list — topics where the student's rolling
 * average is under 70%. Hidden entirely when there is nothing to review.
 */
export function RecommendedReview() {
  const rows = useQuery(api.adaptive.recommendedReview);
  if (rows === undefined || rows.length === 0) return null;

  return (
    <section className="rounded-2xl border border-orange-500/30 bg-orange-500/[0.07] p-5 backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2">
        <AlertCircle size={16} className="text-orange-300" />
        <h3 className="text-sm font-semibold text-white">Recommended Review</h3>
        <span className="text-xs text-muted-foreground">
          topics under 70%
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => {
          const meta = subjectMeta(r.subjectSlug);
          const rgb = hexToRgb(meta.color);
          return (
            <Link
              key={r.topicId}
              href={`/subjects/${r.subjectSlug}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 transition hover:border-white/20"
              style={{ boxShadow: `0 0 16px rgba(${rgb},0.08)` }}
            >
              <div className="mr-auto min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {r.topicName}
                </p>
                <p className="text-xs text-muted-foreground">{meta.name}</p>
              </div>
              <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-300">
                {r.avg}%
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
