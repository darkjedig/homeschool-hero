"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, ChevronRight, RefreshCw, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hexToRgb } from "@/lib/subjects";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function shiftISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function ParentCalendarPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [around, setAround] = useState(today);
  const [busy, setBusy] = useState(false);
  const week = useQuery(api.calendar.getWeek, { around });
  const year = useQuery(api.calendar.getSchoolYear);
  const generate = useMutation(api.calendar.generateYear);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <CalendarDays size={22} className="text-blue-400" /> School Calendar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {year ? `${year.name} · ${year.startDate} → ${year.endDate}` : "Loading…"}
          </p>
        </div>
        <Button
          onClick={async () => {
            if (!confirm("Regenerate the full year calendar? This clears and rebuilds all entries.")) return;
            setBusy(true);
            try {
              await generate({});
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          variant="outline"
        >
          <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
          Regenerate year
        </Button>
      </header>

      <div className="flex items-center gap-2">
        <button onClick={() => setAround(shiftISO(around, -7))} className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setAround(today)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">
          This week
        </button>
        <button onClick={() => setAround(shiftISO(around, 7))} className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {week?.dates.map((date, i) => {
          const entries = week.days[date] ?? [];
          const isToday = date === today;
          const isWeekend = i >= 5;
          return (
            <div
              key={date}
              className={
                "min-h-[100px] rounded-xl border p-2 " +
                (isToday ? "border-blue-500/40 bg-blue-500/[0.05]" : isWeekend ? "border-white/5 bg-white/[0.01]" : "border-white/10 bg-white/[0.03]")
              }
            >
              <p className={"mb-1 text-[10px] font-semibold " + (isToday ? "text-blue-300" : "text-muted-foreground")}>
                {DAY_NAMES[i]}
              </p>
              <div className="space-y-1">
                {entries.map((e) => {
                  const rgb = hexToRgb(e.subjectColor);
                  return (
                    <div
                      key={e._id}
                      className="rounded-md border px-1.5 py-1 text-[10px]"
                      style={{ borderColor: `${e.subjectColor}40`, backgroundColor: `rgba(${rgb},0.08)` }}
                    >
                      <p className="truncate font-medium text-white">{e.lessonTitle ?? e.subjectName}</p>
                      <p className="text-muted-foreground">{e.subjectName}</p>
                    </div>
                  );
                })}
                {entries.length === 0 && !isWeekend && (
                  <p className="text-center text-[9px] text-muted-foreground">Off</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
