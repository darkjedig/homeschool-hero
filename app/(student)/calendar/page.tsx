"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarCheck, CheckCircle2, Circle } from "lucide-react";
import { hexToRgb } from "@/lib/subjects";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Day-of-week with Monday = 0 .. Sunday = 6 (for grid offset). */
function mondayDow(d: Date): number {
  return (d.getUTCDay() + 6) % 7;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());

  const monthData = useQuery(api.calendar.getMonth, { year, month });
  const schoolYear = useQuery(api.calendar.getSchoolYear);
  const today = toISO(now);

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1);
  };

  // Build the grid: find day-of-week of the 1st (Monday-based), pad with empty cells.
  const firstDate = new Date(Date.UTC(year, month, 1));
  const leadPad = mondayDow(firstDate);
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < leadPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISO(new Date(Date.UTC(year, month, d))));
  while (cells.length % 7 !== 0) cells.push(null);

  const holidays = schoolYear?.holidays ?? [];

  function holidayFor(iso: string): string | null {
    const h = holidays.find((h) => iso >= h.start && iso <= h.end);
    return h ? h.name : null;
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <CalendarCheck size={22} className="text-blue-400" />
            {MONTHS[month]} {year}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Click a lesson to start it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => { setYear(now.getUTCFullYear()); setMonth(now.getUTCMonth()); }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
          >
            Today
          </button>
          <button onClick={nextMonth} className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1.5">
        {DOW.map((d) => (
          <div key={d} className="pb-1 text-center text-xs font-semibold uppercase text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} className="min-h-[100px] rounded-lg bg-white/[0.01]" />;

          const entries = monthData?.days[iso] ?? [];
          const isToday = iso === today;
          const dow = i % 7;
          const isWeekend = dow >= 5;
          const holiday = holidayFor(iso);
          const dayNum = new Date(iso + "T00:00:00Z").getUTCDate();

          return (
            <div
              key={iso}
              className={
                "min-h-[100px] rounded-lg border p-1.5 " +
                (isToday
                  ? "border-blue-500/50 bg-blue-500/[0.07] shadow-[0_0_16px_rgba(59,130,246,0.15)]"
                  : holiday
                    ? "border-purple-500/25 bg-purple-500/[0.05]"
                    : isWeekend
                      ? "border-white/5 bg-white/[0.01]"
                      : "border-white/10 bg-white/[0.03]")
              }
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={
                  "text-xs font-bold " +
                  (isToday ? "text-blue-300" : holiday ? "text-purple-300" : "text-muted-foreground")
                }>
                  {dayNum}
                </span>
                {holiday && (
                  <span className="truncate text-[8px] font-medium text-purple-300/70">{holiday}</span>
                )}
              </div>
              <div className="space-y-1">
                {entries.map((e) => {
                  const rgb = hexToRgb(e.subjectColor);

                  // No authored lesson yet (e.g. months beyond the current
                  // content) → friendly, non-clickable placeholder chip.
                  if (!e.lessonId) {
                    return (
                      <div
                        key={e._id}
                        className="block rounded border border-dashed border-white/10 px-1 py-0.5 text-[10px]"
                        title={`${e.subjectName}: more lessons coming soon`}
                      >
                        <div className="flex items-center gap-0.5">
                          <Circle size={9} className="shrink-0 text-muted-foreground/40" />
                          <span className="truncate font-medium text-muted-foreground/60">
                            {e.subjectName} · soon
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={e._id}
                      href={`/lessons/${e.lessonId}`}
                      className="block rounded px-1 py-0.5 text-[10px] transition hover:-translate-y-0.5"
                      style={{
                        backgroundColor: `rgba(${rgb},0.12)`,
                        borderLeft: `2px solid ${e.subjectColor}`,
                      }}
                    >
                      <div className="flex items-center gap-0.5">
                        {e.completed ? (
                          <CheckCircle2 size={9} className="shrink-0 text-green-400" />
                        ) : (
                          <Circle size={9} className="shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate font-medium text-white">
                          {e.lessonTitle ?? e.subjectName}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                {!entries.length && !holiday && !isWeekend && (
                  <p className="text-center text-[8px] text-muted-foreground/50">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {monthData === undefined && (
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}
