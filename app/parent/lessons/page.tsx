"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Plus, Pencil, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isYouTubeVideoUrl, isYouTubeSearchUrl } from "@/lib/youtube";
import { CollapsibleSubjectSection } from "@/components/parent/collapsible-subject-section";

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
  topicId: string;
  topicName: string;
  topicOrder: number;
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

      <div className="space-y-3">
        {[...groups.values()].map((g) => {
          // Rows arrive sorted by topic order from the query; group them into
          // contiguous topic blocks so each topic shows as a labelled sub-list.
          const topicGroups: { topicName: string; topicId: string; rows: Row[] }[] = [];
          for (const l of g.rows) {
            const cur = topicGroups[topicGroups.length - 1];
            if (cur && cur.topicId === l.topicId) cur.rows.push(l);
            else topicGroups.push({ topicName: l.topicName, topicId: l.topicId, rows: [l] });
          }
          return (
            <CollapsibleSubjectSection
              key={g.name}
              name={g.name}
              color={g.color}
              count={g.rows.length}
              countLabel="lessons"
            >
              <div className="space-y-4">
                {topicGroups.map((tg) => (
                  <div key={tg.topicId}>
                    <p className="flex items-center gap-2 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: g.color }}
                      />
                      {tg.topicName}
                      <span className="font-normal normal-case text-muted-foreground/70">
                        · {tg.rows.length}
                      </span>
                    </p>
                    <div className="space-y-2">
                      {tg.rows.map((l) => {
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
                  </div>
                ))}
              </div>
            </CollapsibleSubjectSection>
          );
        })}
      </div>
    </div>
  );
}
