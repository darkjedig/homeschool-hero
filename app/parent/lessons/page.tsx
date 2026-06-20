"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Plus, Pencil, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isYouTubeVideoUrl, isYouTubeSearchUrl } from "@/lib/youtube";
import { hexToRgb } from "@/lib/subjects";

type Row = {
  _id: string;
  title: string;
  status: "draft" | "published";
  difficultyLevel: string;
  pointsAwarded: number;
  videoUrl: string;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  subjectColor: string;
};

export default function LessonsManager() {
  const lessons = useQuery(api.lessons.listAllWithSubject);

  // Group by subject.
  const groups = new Map<string, { name: string; color: string; slug: string; rows: Row[] }>();
  for (const l of lessons ?? []) {
    const g = groups.get(l.subjectId) ?? {
      name: l.subjectName,
      color: l.subjectColor,
      slug: l.subjectSlug,
      rows: [],
    };
    g.rows.push(l);
    groups.set(l.subjectId, g);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lessons</h1>
          <p className="text-sm text-muted-foreground">
            Grouped by subject. Edit any lesson to fix its YouTube video.
          </p>
        </div>
        <Link href="/parent/courses/new">
          <Button className="bg-blue-500 text-white hover:bg-blue-400">
            <Plus size={16} /> New course
          </Button>
        </Link>
      </header>

      {lessons !== undefined && lessons.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
          No lessons yet. Use the{" "}
          <Link href="/parent/courses/new" className="text-blue-400 hover:underline">course builder</Link>,{" "}
          <Link href="/parent/lessons/new" className="text-blue-400 hover:underline">add a single lesson</Link>, or the{" "}
          <Link href="/parent/ai-builder" className="text-blue-400 hover:underline">AI builder</Link>.
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
                <span className="text-xs text-muted-foreground">{g.rows.length} lessons</span>
              </div>
              <div
                className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                style={{ boxShadow: `0 0 20px rgba(${rgb},0.06)` }}
              >
                {g.rows.map((l) => {
                  const videoOk = isYouTubeVideoUrl(l.videoUrl);
                  const isSearch = isYouTubeSearchUrl(l.videoUrl);
                  return (
                    <Link
                      key={l._id}
                      href={`/parent/lessons/${l._id}`}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2.5 transition hover:border-white/20"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{l.title}</p>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          {l.difficultyLevel} · {l.pointsAwarded} pts
                          {!videoOk && (isSearch || l.videoUrl) && (
                            <span className="flex items-center gap-1 text-orange-400">
                              <AlertTriangle size={11} /> needs a real video URL
                            </span>
                          )}
                          {videoOk && (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle2 size={11} /> video set
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge variant={l.status === "published" ? "default" : "secondary"}>
                        {l.status}
                      </Badge>
                      <span className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground">
                        <Pencil size={12} /> Edit
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
