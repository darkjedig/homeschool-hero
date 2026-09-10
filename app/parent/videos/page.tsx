"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  Percent,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
} from "recharts";
import { Panel, Stat } from "@/components/parent/space-panel";
import { SizedChart, CHART_TOOLTIP } from "@/components/charts/sized-chart";
import { formatClock, formatWatchMinutes } from "@/lib/utils";
import { subjectMeta } from "@/lib/subjects";

function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ParentVideosPage() {
  const data = useQuery(api.progress.videos);

  const pctBars = (data?.videos ?? []).map((v) => ({
    name:
      v.lessonTitle.length > 18
        ? `${v.lessonTitle.slice(0, 16)}…`
        : v.lessonTitle,
    full: v.lessonTitle,
    pct: v.percentageWatched,
    color: v.subjectColor || "#06b6d4",
  }));

  const pie = [
    { name: "Finished", value: data?.totals.finished ?? 0, color: "#22c55e" },
    {
      name: "In progress",
      value: Math.max(0, (data?.totals.started ?? 0) - (data?.totals.finished ?? 0)),
      color: "#06b6d4",
    },
  ].filter((d) => d.value > 0);

  const subjectBars = (data?.bySubject ?? []).map((s) => ({
    name: subjectMeta(s.slug).shortName,
    minutes: Math.round(s.seconds / 60),
    color: s.color,
  }));

  return (
    <div className="space-y-4">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Watch logs
        </p>
        <h1 className="text-2xl font-bold text-white">
          Video <span className="text-cyan-400">watch</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          How far Hudson got through each lesson video — length, time watched, and percent.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={PlayCircle}
          color="#06b6d4"
          value={data ? String(data.totals.started) : "—"}
          label="Videos started"
        />
        <Stat
          icon={CheckCircle2}
          color="#22c55e"
          value={data ? String(data.totals.finished) : "—"}
          label="Finished (90%+)"
        />
        <Stat
          icon={Clock}
          color="#eab308"
          value={data ? formatWatchMinutes(data.totals.seconds) : "—"}
          label="Total watch time"
        />
        <Stat
          icon={Percent}
          color="#a855f7"
          value={data ? `${data.totals.avgPct}%` : "—"}
          label="Average watched"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          title="Percent watched"
          subtitle="Farthest point in each video"
          accent="#06b6d4"
        >
          <SizedChart>
            {({ width, height }) =>
              pctBars.length === 0 ? (
                <p className="grid h-full place-items-center text-sm text-muted-foreground">
                  No videos logged yet.
                </p>
              ) : (
                <BarChart
                  width={width}
                  height={height}
                  data={pctBars}
                  margin={{ top: 8, right: 8, left: -16, bottom: 24 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={48}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    {...CHART_TOOLTIP}
                    formatter={(value) => [`${value}%`, "Watched"]}
                    labelFormatter={(_, payload) =>
                      String(payload?.[0]?.payload?.full ?? "")
                    }
                  />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {pctBars.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              )
            }
          </SizedChart>
        </Panel>

        <Panel title="Finished vs in progress" subtitle="90% counts as finished" accent="#22c55e">
          <SizedChart>
            {({ width, height }) =>
              pie.length === 0 ? (
                <p className="grid h-full place-items-center text-sm text-muted-foreground">
                  No videos logged yet.
                </p>
              ) : (
                <PieChart width={width} height={height}>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pie.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip {...CHART_TOOLTIP} />
                </PieChart>
              )
            }
          </SizedChart>
        </Panel>
      </section>

      {subjectBars.length > 0 && (
        <Panel title="Watch time by subject" subtitle="Minutes logged" accent="#3b82f6">
          <SizedChart className="h-52 min-h-[13rem]">
            {({ width, height }) => (
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
                <Tooltip
                  {...CHART_TOOLTIP}
                  formatter={(value) => [`${value} min`, "Watched"]}
                />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {subjectBars.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </SizedChart>
        </Panel>
      )}

      <Panel title="All videos" subtitle="Newest first — click a row to edit the lesson" accent="#06b6d4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Lesson</th>
                <th className="pb-3 pr-4 font-medium">Watched</th>
                <th className="pb-3 pr-4 font-medium">Length</th>
                <th className="pb-3 pr-4 font-medium">Percent</th>
                <th className="pb-3 font-medium">Last watched</th>
              </tr>
            </thead>
            <tbody>
              {(data?.videos ?? []).map((v) => {
                const accent = v.subjectColor ?? "#06b6d4";
                return (
                  <tr key={v.progressId} className="border-t border-white/5">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/parent/lessons/${v.lessonId}`}
                        className="flex items-center gap-2.5 hover:text-cyan-300"
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: accent,
                            boxShadow: `0 0 8px ${accent}`,
                          }}
                        />
                        <span>
                          <span className="block font-medium text-white">
                            {v.lessonTitle}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {v.subjectName ?? "Lesson"}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-white">
                      {formatClock(v.secondsWatched)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {v.durationSeconds
                        ? formatClock(v.durationSeconds)
                        : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            "rounded-full px-2 py-0.5 text-xs font-semibold " +
                            (v.completed
                              ? "bg-green-500/15 text-green-300"
                              : "bg-cyan-500/15 text-cyan-300")
                          }
                        >
                          {v.percentageWatched}%
                        </span>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, v.percentageWatched)}%`,
                              backgroundColor: accent,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {formatDateTime(v.updatedAt)}
                    </td>
                  </tr>
                );
              })}
              {(data?.videos ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No video watch logs yet. Time is recorded when a YouTube video
                    plays in a lesson.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
