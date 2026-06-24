"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CheckCircle2,
  Brain,
  Coins,
  Trophy,
  Gamepad2,
} from "lucide-react";
import {
  ResponsiveContainer,
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
import { subjectMeta, hexToRgb } from "@/lib/subjects";
import Link from "next/link";

// Shared Recharts tooltip — light text on dark glass so it's readable.
const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "0.75rem",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    color: "#ffffff",
    fontSize: "12px",
  },
  itemStyle: { color: "#e2e8f0" },
  labelStyle: { color: "#94a3b8", marginBottom: "2px" },
  cursor: { fill: "rgba(255,255,255,0.06)" },
};

export default function ParentDashboardPage() {
  const stats = useQuery(api.dashboard.overview);
  const subjects = useQuery(api.subjects.list);
  const interactive = useQuery(api.interactiveResults.recentForParents, { limit: 12 });

  const lessonsBySubject = (subjects ?? []).map((s) => ({
    name: subjectMeta(s.slug).shortName,
    lessons: 0,
    color: subjectMeta(s.slug).color,
  }));

  const scoreOverTime = (stats?.recentAttempts ?? [])
    .slice()
    .reverse()
    .map((a, i) => ({ name: `#${i + 1}`, score: a.percentage }));

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-transparent p-6 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.12)]">
        <h1 className="text-2xl font-bold text-white">Parent Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Progress, content and engagement across all subjects.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat icon={BookOpen} color="#3b82f6" value={stats ? String(stats.counts.subjects) : "—"} label="Subjects" href="/parent/subjects" />
        <Stat icon={CheckCircle2} color="#22c55e" value={stats ? String(stats.counts.publishedLessons) : "—"} label="Published lessons" href="/parent/lessons" />
        <Stat icon={Brain} color="#a855f7" value={stats ? String(stats.counts.attempts) : "—"} label="Quiz attempts" href="/parent/quizzes" />
        <Stat icon={Trophy} color="#f97316" value={stats ? `${stats.avgScore}%` : "—"} label="Avg score" href="/parent/quizzes" />
        <Stat icon={Coins} color="#eab308" value={stats ? stats.totalPoints.toLocaleString() : "—"} label="Points earned" href="/parent/history" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Lessons published per subject" subtitle="Distribution of live lessons" accent="#3b82f6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lessonsBySubject} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="lessons" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {lessonsBySubject.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Quiz scores over recent attempts" subtitle="Last 8 results (%)" accent="#22c55e">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreOverTime} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} fill="url(#scoreFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </section>

      <Panel title="Recent quiz attempts" subtitle="Latest activity in real time" accent="#a855f7">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Quiz</th>
                <th className="pb-3 pr-4 font-medium">Score</th>
                <th className="pb-3 pr-4 font-medium">Result</th>
                <th className="pb-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentAttempts ?? []).map((a) => (
                <tr key={a._id} className="border-t border-white/5">
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                    {a.quizId ? a.quizId.slice(-8) : "Friday"}
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
              ))}
              {(stats?.recentAttempts ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No quiz attempts yet. Once lessons are published and quizzes are
                    taken, results appear here in real time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    </div>
  );
}

function Panel({
  title,
  subtitle,
  accent = "#3b82f6",
  children,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  children: React.ReactNode;
}) {
  const rgb = hexToRgb(accent);
  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      style={{ boxShadow: `0 0 24px rgba(${rgb},0.08)` }}
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          className="h-5 w-1 rounded-full"
          style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }}
        />
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Stat({
  icon: Icon,
  color,
  value,
  label,
  href,
}: {
  icon: LucideIcon;
  color: string;
  value: string;
  label: string;
  href?: string;
}) {
  const rgb = hexToRgb(color);
  const inner = (
    <>
      <div
        className="mb-4 grid h-11 w-11 place-items-center rounded-xl"
        style={{ backgroundColor: `${color}22`, boxShadow: `0 0 18px ${color}55` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-white xl:text-3xl">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </>
  );
  const cls = `relative block overflow-hidden rounded-2xl border bg-gradient-to-b from-white/[0.07] to-transparent p-5 backdrop-blur-md transition hover:-translate-y-0.5 ${
    href ? "cursor-pointer hover:brightness-110" : ""
  }`;
  const style = { borderColor: `${color}33`, boxShadow: `0 0 24px rgba(${rgb},0.14)` };
  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={cls} style={style}>
      {inner}
    </div>
  );
}
