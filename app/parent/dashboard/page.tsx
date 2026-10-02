"use client";

import { AiMascot } from "@/components/student/ai-mascot";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BookOpen,
  CheckCircle2,
  Brain,
  Coins,
  Trophy,
  Gamepad2,
  PlayCircle,
  Check,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { subjectMeta } from "@/lib/subjects";
import { formatClock, formatWatchMinutes } from "@/lib/utils";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Panel, Stat } from "@/components/parent/space-panel";
import { SizedChart, CHART_TOOLTIP } from "@/components/charts/sized-chart";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ParentDashboardPage() {
  const stats = useQuery(api.dashboard.overview);
  const pulse = useQuery(api.dashboard.householdPulse);
  const interactive = useQuery(api.interactiveResults.recentForParents, { limit: 12 });
  const [selectedAttemptId, setSelectedAttemptId] = useState<
    Id<"quizAttempts"> | null
  >(null);

  const lessonsBySubject = (stats?.lessonsBySubject ?? []).map((s) => ({
    name: subjectMeta(s.slug).shortName,
    lessons: s.lessons,
    color: s.color || subjectMeta(s.slug).color,
  }));

  const scoreOverTime = (stats?.recentAttempts ?? [])
    .slice()
    .reverse()
    .map((a, i) => ({ name: `#${i + 1}`, score: a.percentage, title: a.title }));

  return (
    <div className="parent-dashboard space-y-4">
      <header className="dashboard-header flex flex-wrap items-center justify-between gap-4">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">Your family’s learning journey</p><h1 className="text-2xl font-bold text-white">Parent <span className="text-cyan-400">Dashboard</span></h1><p className="mt-2 text-sm text-muted-foreground">Progress, content and engagement across all subjects.</p></div>
        <AiMascot message="Big dreams start with small steps. Let's help them grow!" />
        <Link href="/parent/lessons/new" className="rounded-xl border border-cyan-400/30 bg-gradient-to-b from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">+ Create a lesson</Link>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat icon={CheckCircle2} color="#22c55e" value={pulse ? String(pulse.lessonsCompleted) : "—"} label="Lessons completed" href="/parent/progress" />
        <Stat icon={PlayCircle} color="#06b6d4" value={pulse ? `${pulse.videosCompleted}/${pulse.videosWatched}` : "—"} label="Videos finished" href="/parent/videos" />
        <Stat icon={Brain} color="#a855f7" value={stats ? String(stats.counts.attempts) : "—"} label="Quiz attempts" href="/parent/quizzes" />
        <Stat icon={Trophy} color="#f97316" value={stats ? `${stats.avgScore}%` : "—"} label="Avg score" href="/parent/quizzes" />
        <Stat icon={Coins} color="#eab308" value={stats ? stats.totalPoints.toLocaleString() : "—"} label="Points earned" href="/parent/history" />
        <Stat icon={BookOpen} color="#3b82f6" value={stats ? String(stats.counts.publishedLessons) : "—"} label="Published lessons" href="/parent/lessons" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Lessons published per subject" subtitle="Distribution of live lessons" accent="#3b82f6">
          <SizedChart>
            {({ width, height }) =>
              lessonsBySubject.length === 0 ? (
                <p className="grid h-full place-items-center text-sm text-muted-foreground">
                  {stats === undefined ? "Loading…" : "No published lessons yet."}
                </p>
              ) : (
                <BarChart width={width} height={height} data={lessonsBySubject} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Bar dataKey="lessons" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {lessonsBySubject.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              )
            }
          </SizedChart>
        </Panel>

        <Panel title="Quiz scores over recent attempts" subtitle="Last 8 results (%)" accent="#22c55e">
          <SizedChart>
            {({ width, height }) => (
              <AreaChart width={width} height={height} data={scoreOverTime} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} fill="url(#scoreFill)" />
              </AreaChart>
            )}
          </SizedChart>
        </Panel>
      </section>

      <Panel title="Recent quiz attempts" subtitle="Latest activity in real time — click a row for full results" accent="#a855f7">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Quiz</th>
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Score</th>
                <th className="pb-3 pr-4 font-medium">Result</th>
                <th className="pb-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentAttempts ?? []).map((a) => {
                const accent = a.isFriday
                  ? "#a855f7"
                  : a.subjectColor ?? "#3b82f6";
                return (
                  <tr
                    key={a.attemptId}
                    onClick={() => setSelectedAttemptId(a.attemptId)}
                    className="cursor-pointer border-t border-white/5 transition hover:bg-white/[0.04]"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{a.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {a.isFriday
                              ? "Friday Challenge"
                              : [a.subjectName, a.subtitle].filter(Boolean).join(" · ") || "Quiz"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {formatDate(a.completedAt)}
                    </td>
                    <td className="py-3 pr-4 text-white">
                      {a.correctAnswers}/{a.totalQuestions}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-xs font-semibold " +
                          (a.percentage >= 60
                            ? "bg-green-500/15 text-green-300"
                            : "bg-orange-500/15 text-orange-300")
                        }
                      >
                        {a.percentage}%
                      </span>
                    </td>
                    <td className="py-3 text-yellow-300">+{a.pointsEarned}</td>
                  </tr>
                );
              })}
              {(stats?.recentAttempts ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No quiz attempts yet. Once lessons are published and quizzes are
                    taken, results appear here in real time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Video watch time"
        subtitle={
          pulse
            ? `${formatWatchMinutes(pulse.videoSeconds)} watched · ${pulse.videosCompleted} finished of ${pulse.videosWatched} started`
            : "How much of each lesson video was actually watched"
        }
        accent="#06b6d4"
      >
        <div className="space-y-2">
          {(pulse?.recentVideo ?? []).map((v) => {
            const accent = v.subjectColor ?? "#06b6d4";
            const watched = formatClock(v.secondsWatched);
            const total = v.durationSeconds ? formatClock(v.durationSeconds) : null;
            return (
              <div
                key={v.progressId}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
              >
                <span
                  className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: `${accent}22` }}
                >
                  <PlayCircle size={15} style={{ color: accent }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <Link
                      href={`/parent/lessons/${v.lessonId}`}
                      className="truncate text-sm font-medium text-white hover:text-cyan-300"
                    >
                      {v.lessonTitle}
                    </Link>
                    {v.subjectName && (
                      <span className="text-[11px] text-muted-foreground">{v.subjectName}</span>
                    )}
                    {v.completed && (
                      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-300">
                        Finished
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {total ? `${watched} / ${total}` : `${watched} watched`}
                    {" · "}
                    {v.percentageWatched}%
                    {" · "}
                    {formatDateTime(v.updatedAt)}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, v.percentageWatched)}%`,
                        backgroundColor: accent,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {(pulse?.recentVideo ?? []).length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No video watch logs yet. Time is recorded when a YouTube video plays
              in a lesson — including how long the video is and how far it was
              watched. Lessons without a YouTube URL (IXL days and most seeded
              lessons) will not appear here. Interactive activity is listed below.
            </p>
          )}
          <p className="pt-2 text-center">
            <Link href="/parent/videos" className="text-xs font-medium text-cyan-400 hover:underline">
              Open video watch page →
            </Link>
          </p>
        </div>
      </Panel>

      <Panel
        title="Lessons completed"
        subtitle="Video, quiz, or activity finished — click for the full list"
        accent="#22c55e"
      >
        <div className="space-y-2">
          {(pulse?.recentCompletedLessons ?? []).map((l) => (
            <Link
              key={l.lessonId}
              href={`/parent/lessons/${l.lessonId}`}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-white/15"
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${l.subjectColor ?? "#22c55e"}22` }}
              >
                <CheckCircle2 size={15} style={{ color: l.subjectColor ?? "#22c55e" }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{l.lessonTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {l.subjectName ?? "Lesson"}
                  {" · "}
                  {formatDateTime(l.lastAt)}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {l.videoDone && (
                  <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-cyan-300">
                    Video
                  </span>
                )}
                {l.quizDone && (
                  <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-300">
                    Quiz
                  </span>
                )}
                {l.interactiveDone && (
                  <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-300">
                    Activity
                  </span>
                )}
              </div>
            </Link>
          ))}
          {(pulse?.recentCompletedLessons ?? []).length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No completed lessons yet. When Hudson finishes a video, quiz, or
              flashcards, they show up here.
            </p>
          )}
          <p className="pt-2 text-center">
            <Link href="/parent/progress" className="text-xs font-medium text-cyan-400 hover:underline">
              Open lessons completed →
            </Link>
          </p>
        </div>
      </Panel>

      <Panel title="Recent interactive activity" subtitle="What students did in lesson activities" accent="#06b6d4">
        <div className="space-y-2">
          {(interactive ?? []).map((r) => (
            <div
              key={r._id}
              className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
            >
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${r.subjectColor}22` }}
              >
                <Gamepad2 size={15} style={{ color: r.subjectColor }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <Link
                    href={`/parent/lessons/${r.lessonId}`}
                    className="truncate text-sm font-medium text-white hover:text-cyan-300"
                  >
                    {r.lessonTitle}
                  </Link>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {r.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{r.subjectName}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground" title={r.detail}>
                  {r.detail}
                </p>
              </div>
              {r.percentage !== undefined && (
                <span
                  className={
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold " +
                    (r.percentage >= 60
                      ? "bg-green-500/15 text-green-300"
                      : "bg-orange-500/15 text-orange-300")
                  }
                >
                  {r.percentage}%
                </span>
              )}
            </div>
          ))}
          {(interactive ?? []).length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No interactive activity yet. As students play lesson activities,
              their attempts and results appear here in real time.
            </p>
          )}
        </div>
      </Panel>

      <AttemptDetailDialog
        attemptId={selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
      />
    </div>
  );
}

function AttemptDetailDialog({
  attemptId,
  onClose,
}: {
  attemptId: Id<"quizAttempts"> | null;
  onClose: () => void;
}) {
  const detail = useQuery(
    api.quizzes.attemptDetail,
    attemptId ? { attemptId } : "skip",
  );

  return (
    <Dialog open={attemptId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {detail?.isFriday && (
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-300">
                Friday
              </span>
            )}
            {detail?.title ?? "Quiz results"}
          </DialogTitle>
          <DialogDescription>
            {detail
              ? [detail.subjectName, detail.subtitle].filter(Boolean).join(" · ") ||
                "Quiz results"
              : "Loading…"}
          </DialogDescription>
        </DialogHeader>

        {!detail ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <ScoreStat
                label="Score"
                value={`${detail.attempt.percentage}%`}
                color={detail.attempt.percentage >= 60 ? "#22c55e" : "#f97316"}
              />
              <ScoreStat
                label="Correct"
                value={`${detail.attempt.correctAnswers}/${detail.attempt.totalQuestions}`}
              />
              <ScoreStat
                label="Points"
                value={`+${detail.attempt.pointsEarned}`}
                color="#eab308"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Completed {formatDate(detail.attempt.completedAt)}
            </p>

            <div className="space-y-2">
              {detail.questions.map((q, i) => (
                <div
                  key={i}
                  className={
                    "rounded-xl border p-3 " +
                    (q.correct
                      ? "border-green-500/20 bg-green-500/[0.04]"
                      : "border-orange-500/20 bg-orange-500/[0.04]")
                  }
                >
                  <div className="flex items-start gap-2">
                    {q.correct ? (
                      <Check size={15} className="mt-0.5 shrink-0 text-green-400" />
                    ) : (
                      <X size={15} className="mt-0.5 shrink-0 text-orange-400" />
                    )}
                    <p className="text-sm font-medium text-white">
                      {i + 1}. {q.questionText}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1 pl-7 text-xs">
                    {q.available ? (
                      <>
                        <p className="text-orange-300">
                          Their answer:{" "}
                          <span className="font-medium">{q.selectedAnswer || "—"}</span>
                        </p>
                        {!q.correct && (
                          <p className="text-green-300">
                            Correct answer:{" "}
                            <span className="font-medium">{q.correctAnswer}</span>
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-muted-foreground">{q.explanation}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">{q.questionText}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ScoreStat({
  label,
  value,
  color = "#ffffff",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}


