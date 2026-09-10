"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  PlayCircle,
  ListChecks,
  Gamepad2,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Panel, Stat } from "@/components/parent/space-panel";
import { SizedChart, CHART_TOOLTIP } from "@/components/charts/sized-chart";
import { subjectMeta } from "@/lib/subjects";
import { Button } from "@/components/ui/button";

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Chip({
  on,
  label,
}: {
  on: boolean;
  label: string;
}) {
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide " +
        (on
          ? "bg-green-500/15 text-green-300"
          : "bg-white/10 text-muted-foreground")
      }
    >
      {label}
    </span>
  );
}

export default function ParentProgressPage() {
  const today = todayISO();
  const data = useQuery(api.progress.forParent, { today });
  const mark = useMutation(api.progress.markDateComplete);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const subjectBars = (data?.bySubject ?? [])
    .filter((s) => s.completed > 0)
    .map((s) => ({
      name: subjectMeta(s.slug).shortName,
      completed: s.completed,
      color: s.color,
    }));

  const todayDone = (data?.today ?? []).filter((t) => t.completed).length;
  const todayTotal = data?.today.length ?? 0;

  const markDay = async (date: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await mark({ date });
      setMsg(
        res.titles.length
          ? `Marked complete: ${res.titles.join(", ")}`
          : "No lessons on that date to mark.",
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not mark complete");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Daily work
        </p>
        <h1 className="text-2xl font-bold text-white">
          Lessons <span className="text-cyan-400">completed</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A lesson counts as done when Hudson finishes the video, the quiz, or
          an interactive (flashcards and games) — or when you mark the day complete.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={CheckCircle2}
          color="#22c55e"
          value={data ? String(data.counts.completed) : "—"}
          label="Lessons completed"
        />
        <Stat
          icon={PlayCircle}
          color="#06b6d4"
          value={data ? String(data.counts.video) : "—"}
          label="Videos finished"
          href="/parent/videos"
        />
        <Stat
          icon={ListChecks}
          color="#a855f7"
          value={data ? String(data.counts.quiz) : "—"}
          label="Quizzes taken"
          href="/parent/quizzes"
        />
        <Stat
          icon={Gamepad2}
          color="#f97316"
          value={data ? String(data.counts.interactive) : "—"}
          label="Activities done"
        />
      </section>

      <Panel
        title="Today’s planned lessons"
        subtitle={
          todayTotal
            ? `${todayDone} of ${todayTotal} complete · ${today}`
            : "Nothing scheduled for today"
        }
        accent="#22c55e"
      >
        <div className="space-y-2">
          {(data?.today ?? []).map((t, i) => (
            <div
              key={`${t.lessonId ?? "slot"}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${t.subjectColor}22` }}
              >
                <CheckCircle2
                  size={15}
                  style={{ color: t.completed ? "#22c55e" : t.subjectColor }}
                />
              </span>
              <div className="min-w-0 flex-1">
                {t.lessonId ? (
                  <Link
                    href={`/parent/lessons/${t.lessonId}`}
                    className="truncate text-sm font-medium text-white hover:text-cyan-300"
                  >
                    {t.lessonTitle}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-white">{t.lessonTitle}</p>
                )}
                <p className="text-xs text-muted-foreground">{t.subjectName}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Chip on={t.videoDone} label="Video" />
                <Chip on={t.quizDone} label="Quiz" />
                <Chip on={t.interactiveDone} label="Activity" />
              </div>
            </div>
          ))}
          {todayTotal === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No calendar lessons for today.
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {todayTotal > 0 && todayDone < todayTotal && (
            <Button
              onClick={() => void markDay(today)}
              disabled={busy}
              className="bg-green-600 text-white hover:bg-green-500"
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Mark today complete
            </Button>
          )}
          <Button
            onClick={() => void markDay("2026-09-10")}
            disabled={busy}
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            Mark 10 Sep complete
          </Button>
          {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
        </div>
      </Panel>

      <Panel
        title="Completed per subject"
        subtitle="Video, quiz, activity, or parent mark"
        accent="#3b82f6"
      >
        <SizedChart>
          {({ width, height }) =>
            subjectBars.length === 0 ? (
              <p className="grid h-full place-items-center text-sm text-muted-foreground">
                No completed lessons yet.
              </p>
            ) : (
              <BarChart
                width={width}
                height={height}
                data={subjectBars}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="completed" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {subjectBars.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            )
          }
        </SizedChart>
      </Panel>

      <Panel title="Completed lessons" subtitle="Newest first" accent="#22c55e">
        <div className="space-y-2">
          {(data?.lessons ?? []).map((l) => (
            <Link
              key={l.lessonId}
              href={`/parent/lessons/${l.lessonId}`}
              className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-white/15"
            >
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${l.subjectColor}22` }}
              >
                <CheckCircle2 size={15} style={{ color: l.subjectColor }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {l.lessonTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {l.subjectName}
                  {" · "}
                  {formatDateTime(l.lastAt)}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                <Chip
                  on={l.videoDone}
                  label={l.videoPct !== null ? `Video ${l.videoPct}%` : "Video"}
                />
                <Chip
                  on={l.quizDone}
                  label={l.quizPct !== null ? `Quiz ${l.quizPct}%` : "Quiz"}
                />
                <Chip
                  on={l.interactiveDone}
                  label={
                    l.interactiveCount > 0
                      ? `Activity ×${l.interactiveCount}`
                      : "Activity"
                  }
                />
                {l.marked && <Chip on label="Marked" />}
              </div>
            </Link>
          ))}
          {(data?.lessons ?? []).length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing completed yet. As Hudson watches videos, takes quizzes, or
              plays flashcards, lessons appear here.
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}
