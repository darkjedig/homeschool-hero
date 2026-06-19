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
import { subjectMeta } from "@/lib/subjects";

export default function ParentDashboardPage() {
  const stats = useQuery(api.dashboard.overview);
  const subjects = useQuery(api.subjects.list);
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
      <header>
        <h1 className="text-2xl font-bold text-white">Parent Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Progress, content and engagement across all subjects.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat icon={BookOpen} color="#3b82f6" value={stats ? String(stats.counts.subjects) : "—"} label="Subjects" />
        <Stat icon={CheckCircle2} color="#22c55e" value={stats ? String(stats.counts.publishedLessons) : "—"} label="Published" />
        <Stat icon={Brain} color="#a855f7" value={stats ? String(stats.counts.attempts) : "—"} label="Quiz attempts" />
        <Stat icon={Trophy} color="#f97316" value={stats ? `${stats.avgScore}%` : "—"} label="Avg score" />
        <Stat icon={Coins} color="#eab308" value={stats ? stats.totalPoints.toLocaleString() : "—"} label="Points earned" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">
            Lessons published per subject
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lessonsBySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="lessons" radius={[6, 6, 0, 0]}>
                  {lessonsBySubject.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">
            Quiz scores over recent attempts
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreOverTime}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#scoreFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Recent quiz attempts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground">
                <th className="pb-2">Quiz</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">%</th>
                <th className="pb-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentAttempts ?? []).map((a) => (
                <tr key={a._id} className="border-t border-white/5">
                  <td className="py-2 font-mono text-xs text-muted-foreground">
                    {a.quizId.slice(-8)}
                  </td>
                  <td className="py-2 text-white">
                    {a.correctAnswers}/{a.totalQuestions}
                  </td>
                  <td className="py-2 text-white">{a.percentage}%</td>
                  <td className="py-2 text-yellow-300">+{a.pointsEarned}</td>
                </tr>
              ))}
              {(stats?.recentAttempts ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    No quiz attempts yet. Once lessons are published and quizzes are
                    taken, results show up here in real time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: LucideIcon;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div
        className="mb-3 grid h-9 w-9 place-items-center rounded-lg"
        style={{ backgroundColor: `${color}22` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
