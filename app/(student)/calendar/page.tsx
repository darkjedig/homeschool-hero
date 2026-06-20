"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle } from "lucide-react";
import { hexToRgb } from "@/lib/subjects";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function shiftISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function prettyDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function CalendarPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [around, setAround] = useState(today);
  const week = useQuery(api.calendar.getWeek, { around });

  const prevWeek = () => setAround(shiftISO(around, -7));
  const nextWeek = () => setAround(shiftISO(around, 7));
  const thisWeek = () => setAround(today);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <CalendarIcon size={22} className="text-blue-400" /> Calendar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your school week. Click a lesson to start.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white">
            <ChevronLeft size={18} />
          </button>
          <button onClick={thisWeek} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">
            Today
          </button>
          <button onClick={nextWeek} className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {week?.dates.map((date, i) => {
          const entries = week.days[date] ?? [];
          const isToday = date === today;
          const isWeekend = i >= 5;
          return (
            <div
              key={date}
              className={
                "min-h-[120px] rounded-2xl border p-3 " +
                (isToday
                  ? "border-blue-500/50 bg-blue-500/[0.07] shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : isWeekend
                    ? "border-white/5 bg-white/[0.02]"
                    : "border-white/10 bg-white/[0.03]")
              }
            >
              <p className={"mb-2 text-xs font-semibold " + (isToday ? "text-blue-300" : "text-muted-foreground")}>
                {DAY_NAMES[i]}
                <span className="ml-1 opacity-60">{prettyDate(date).split(" ").slice(-2).join(" ")}</span>
              </p>
              <div className="space-y-1.5">
                {entries.map((e) => {
                  const rgb = hexToRgb(e.subjectColor);
                  return (
                    <Link
                      key={e._id}
                      href={e.lessonId ? `/lessons/${e.lessonId}` : "#"}
                      className={
                        "block rounded-lg border px-2 py-1.5 text-xs transition " +
                        (e.lessonId
                          ? "hover:-translate-y-0.5"
                          : "cursor-default opacity-60")
                      }
                      style={{
                        borderColor: `${e.subjectColor}40`,
                        backgroundColor: `rgba(${rgb},0.08)`,
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {e.completed ? (
                          <CheckCircle2 size={11} className="shrink-0 text-green-400" />
                        ) : (
                          <Circle size={11} className="shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate font-medium text-white">
                          {e.lessonTitle ?? e.subjectName}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{e.subjectName}</span>
                    </Link>
                  );
                })}
                {entries.length === 0 && !isWeekend && (
                  <p className="py-2 text-center text-[10px] text-muted-foreground">Holiday / off</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {week === undefined && (
        <p className="text-center text-sm text-muted-foreground">Loading calendar…</p>
      )}
    </div>
  );
}
