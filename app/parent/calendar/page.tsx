"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, ChevronRight, RefreshCw, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hexToRgb } from "@/lib/subjects";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function toISO(d: Date): string { return d.toISOString().slice(0, 10); }
function mondayDow(d: Date): number { return (d.getUTCDay() + 6) % 7; }

export default function ParentCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());
  const [busy, setBusy] = useState(false);

  const monthData = useQuery(api.calendar.getMonth, { year, month });
  const schoolYear = useQuery(api.calendar.getSchoolYear);
  const generate = useMutation(api.calendar.generateYear);

  const prevMonth = () => { if (month===0){setYear(year-1);setMonth(11)}else setMonth(month-1) };
  const nextMonth = () => { if (month===11){setYear(year+1);setMonth(0)}else setMonth(month+1) };

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
            <CalendarDays size={22} className="text-blue-400" />
            {MONTHS[month]} {year}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {schoolYear ? `${schoolYear.name} · ${schoolYear.startDate} → ${schoolYear.endDate}` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={async () => {
              if (!confirm("Regenerate the full year calendar? This clears and rebuilds all entries.")) return;
              setBusy(true);
              try { await generate({}); } finally { setBusy(false); }
            }}
            disabled={busy}
            variant="outline"
          >
            <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
            Regenerate
          </Button>
        </div>
      </header>

      <div className="flex items-center gap-2">
        <button onClick={prevMonth} className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => { setYear(now.getUTCFullYear()); setMonth(now.getUTCMonth()); }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white">
          This month
        </button>
        <button onClick={nextMonth} className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DOW.map((d) => (
          <div key={d} className="pb-1 text-center text-xs font-semibold uppercase text-muted-foreground">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} className="min-h-[90px] rounded-lg bg-white/[0.01]" />;
          const entries = monthData?.days[iso] ?? [];
          const isWeekend = i % 7 >= 5;
          const holiday = holidayFor(iso);
          const dayNum = new Date(iso + "T00:00:00Z").getUTCDate();
          return (
            <div
              key={iso}
              className={
                "min-h-[90px] rounded-lg border p-1.5 " +
                (holiday ? "border-purple-500/25 bg-purple-500/[0.05]" : isWeekend ? "border-white/5 bg-white/[0.01]" : "border-white/10 bg-white/[0.03]")
              }
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={"text-xs font-bold " + (holiday ? "text-purple-300" : "text-muted-foreground")}>{dayNum}</span>
                {holiday && <span className="truncate text-[8px] font-medium text-purple-300/70">{holiday}</span>}
              </div>
              <div className="space-y-0.5">
                {entries.map((e) => {
                  const rgb = hexToRgb(e.subjectColor);
                  return (
                    <div key={e._id} className="rounded px-1 py-0.5 text-[10px]" style={{ backgroundColor: `rgba(${rgb},0.12)`, borderLeft: `2px solid ${e.subjectColor}` }}>
                      <span className="truncate block font-medium text-white">{e.lessonTitle ?? e.subjectName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {monthData === undefined && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
    </div>
  );
}
