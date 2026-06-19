"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const DATA = [
  { name: "Lessons", value: 72, color: "#3b82f6" },
  { name: "Quizzes", value: 68, color: "#a855f7" },
  { name: "Challenges", value: 60, color: "#22c55e" },
  { name: "Badges", value: 75, color: "#f97316" },
];

/** Overall progress donut (Recharts) with legend. */
export function OverallProgressChart() {
  const overall = Math.round(
    DATA.reduce((s, d) => s + d.value, 0) / DATA.length,
  );
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
        Overall Progress
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DATA}
                dataKey="value"
                innerRadius={38}
                outerRadius={54}
                paddingAngle={3}
                stroke="none"
              >
                {DATA.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-xl font-bold text-white">{overall}%</span>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-xs">
          {DATA.map((d) => (
            <li key={d.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="flex-1 text-muted-foreground">{d.name}</span>
              <span className="font-semibold text-white">{d.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
