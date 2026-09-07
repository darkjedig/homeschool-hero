"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarDays,
  Plus,
  Trash2,
  X,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { hexToRgb } from "@/lib/subjects";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

type EntryView = {
  _id: string;
  date: string;
  slotOrder: number;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  subjectSlug: string;
  lessonId: string | null;
  lessonTitle: string | null;
  label: string | null;
  completed: boolean;
  weekIndex: number;
};

function toISO(d: Date): string { return d.toISOString().slice(0, 10); }
function mondayDow(d: Date): number { return (d.getUTCDay() + 6) % 7; }

export default function ParentCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());
  const [busy, setBusy] = useState(false);

  const [dragEntry, setDragEntry] = useState<EntryView | null>(null);
  const [overEntry, setOverEntry] = useState<EntryView | null>(null);
  const [editing, setEditing] = useState<EntryView | null>(null);
  const [showBreak, setShowBreak] = useState(false);

  const monthData = useQuery(api.calendar.getMonth, { year, month });
  const schoolYear = useQuery(api.calendar.getSchoolYear);
  const picker = useQuery(
    api.calendar.pickerLessons,
    editing ? { subjectId: editing.subjectId as Id<"subjects"> } : "skip",
  );

  const generate = useMutation(api.calendar.generateYear);
  const moveLesson = useMutation(api.calendar.moveLesson);
  const assignLesson = useMutation(api.calendar.assignLesson);
  const clearEntry = useMutation(api.calendar.clearEntry);
  const addBreakMut = useMutation(api.calendar.addBreak);
  const removeBreakMut = useMutation(api.calendar.removeBreak);

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

  const isDropTarget = (e: EntryView) =>
    !!dragEntry && dragEntry._id !== e._id && dragEntry.subjectId === e.subjectId;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <CalendarDays size={22} className="text-blue-400" />
            {MONTHS[month]} {year}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {schoolYear ? `${schoolYear.name} · ${schoolYear.startDate} → ${schoolYear.endDate}` : "Loading…"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setShowBreak(true)} variant="outline">
            <Plus size={16} />
            Add break
          </Button>
          <Button
            onClick={async () => {
              if (!confirm("Regenerate the full year calendar? This clears and rebuilds all entries, erasing manual edits.")) return;
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

      <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-white">Drag</span> a lesson onto the same subject on another day to swap it.
        {" "}Click a lesson to change or remove it. Add a break to auto-shift everything after it.
      </p>

      {holidays.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Breaks:</span>
          {holidays.map((h, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-200"
            >
              {h.name} · {h.start === h.end ? h.start : `${h.start} → ${h.end}`}
              <button
                onClick={async () => {
                  if (!confirm(`Remove "${h.name}" and close the gap? Lessons after ${h.start} will be re-sorted.`)) return;
                  await removeBreakMut({ index: i });
                }}
                className="text-purple-300/70 hover:text-white"
                title="Remove break"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

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
          if (!iso) return <div key={i} className="min-h-[96px] rounded-lg bg-white/[0.01]" />;
          const entries = (monthData?.days[iso] ?? []) as EntryView[];
          const isWeekend = i % 7 >= 5;
          const holiday = holidayFor(iso);
          const dayNum = new Date(iso + "T00:00:00Z").getUTCDate();
          return (
            <div
              key={iso}
              className={
                "min-h-[96px] rounded-lg border p-1.5 " +
                (holiday ? "border-purple-500/25 bg-purple-500/[0.05]" : isWeekend ? "border-white/5 bg-white/[0.01]" : "border-white/10 bg-white/[0.03]")
              }
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={"text-xs font-bold " + (holiday ? "text-purple-300" : "text-muted-foreground")}>{dayNum}</span>
                {holiday && <span className="truncate text-[8px] font-medium text-purple-300/70">{holiday}</span>}
              </div>
              <div className="space-y-0.5">
                {holiday ? (
                  <div className="rounded px-1 py-0.5 text-[10px] text-purple-300/80">— break —</div>
                ) : (
                  entries.map((e) => {
                    const rgb = hexToRgb(e.subjectColor);
                    const droppable = isDropTarget(e);
                    const dragging = dragEntry?._id === e._id;
                    return (
                      <div
                        key={e._id}
                        draggable
                        onDragStart={() => setDragEntry(e)}
                        onDragEnd={() => { setDragEntry(null); setOverEntry(null); }}
                        onDragOver={(ev) => { if (droppable) { ev.preventDefault(); setOverEntry(e); } }}
                        onDragLeave={() => setOverEntry((cur) => (cur?._id === e._id ? null : cur))}
                        onDrop={(ev) => {
                          ev.preventDefault();
                          const src = dragEntry;
                          setDragEntry(null);
                          setOverEntry(null);
                          if (src && src._id !== e._id && src.subjectId === e.subjectId) {
                            moveLesson({
                              sourceEntryId: src._id as Id<"calendarEntries">,
                              targetEntryId: e._id as Id<"calendarEntries">,
                            });
                          }
                        }}
                        onClick={() => setEditing(e)}
                        title={e.lessonTitle ?? e.label ?? e.subjectName}
                        className={
                          "group flex cursor-pointer items-center gap-0.5 rounded px-1 py-0.5 text-[10px] transition " +
                          (dragging ? "opacity-40 " : "") +
                          (overEntry?._id === e._id ? "ring-2 ring-white/70 " : "")
                        }
                        style={{ backgroundColor: `rgba(${rgb},0.12)`, borderLeft: `2px solid ${e.subjectColor}` }}
                      >
                        <GripVertical size={9} className="shrink-0 text-white/30 opacity-0 group-hover:opacity-100" />
                        <span className="truncate font-medium text-white">
                          {e.lessonTitle ?? e.label ?? e.subjectName}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {monthData === undefined && <p className="text-center text-sm text-muted-foreground">Loading…</p>}

      <SlotEditor
        entry={editing}
        picker={picker}
        onClose={() => setEditing(null)}
        onAssign={async (lessonId) => {
          if (!editing) return;
          await assignLesson({
            entryId: editing._id as Id<"calendarEntries">,
            lessonId: lessonId as Id<"lessons"> | undefined,
          });
          setEditing(null);
        }}
        onClear={async () => {
          if (!editing) return;
          await clearEntry({ entryId: editing._id as Id<"calendarEntries"> });
          setEditing(null);
        }}
      />

      <BreakDialog
        open={showBreak}
        onClose={() => setShowBreak(false)}
        defaultDate={toISO(new Date(Date.UTC(year, month, 1)))}
        onAdd={async (startDate, days, name) => {
          await addBreakMut({ startDate, days, name });
          setShowBreak(false);
        }}
      />
    </div>
  );
}

type PickerGroup = {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  subjectSlug: string;
  lessons: { _id: string; title: string; topicId: string }[];
};

function SlotEditor({
  entry,
  picker,
  onClose,
  onAssign,
  onClear,
}: {
  entry: EntryView | null;
  picker: PickerGroup[] | undefined;
  onClose: () => void;
  onAssign: (lessonId: string | undefined) => void;
  onClear: () => void;
}) {
  const lessons = picker?.[0]?.lessons ?? [];
  return (
    <Dialog open={entry !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {entry && (
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.subjectColor, boxShadow: `0 0 8px ${entry.subjectColor}` }}
              />
            )}
            {entry?.subjectName ?? "Slot"}
          </DialogTitle>
          <DialogDescription>
            {entry ? `${entry.date} · slot ${entry.slotOrder + 1}` : ""}
          </DialogDescription>
        </DialogHeader>

        {entry && (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current</p>
              <p className="mt-0.5 font-medium text-white">
                {entry.lessonTitle ?? entry.label ?? "No lesson set"}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Set lesson
              </label>
              <select
                value={entry.lessonId ?? ""}
                onChange={(e) => onAssign(e.target.value || undefined)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              >
                <option value="">— No lesson —</option>
                {lessons.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title}
                  </option>
                ))}
              </select>
              {lessons.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  No published lessons for this subject yet.
                </p>
              )}
            </div>

            {entry.lessonId && (
              <Button onClick={onClear} variant="outline" className="w-full">
                <Trash2 size={14} />
                Remove lesson from this day
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BreakDialog({
  open,
  onClose,
  defaultDate,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  onAdd: (startDate: string, days: number, name: string) => Promise<void>;
}) {
  const [startDate, setStartDate] = useState(defaultDate);
  const [days, setDays] = useState(7);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setStartDate(defaultDate);
          setDays(7);
          setName("");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a break</DialogTitle>
          <DialogDescription>
            Lessons from this date onward auto-shift past the break, keeping each subject in order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Length (days)
              </label>
              <input
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Name (optional)
              </label>
              <input
                type="text"
                placeholder="Holiday"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            = {days} day{days === 1 ? "" : "s"} off. Everything after {startDate || "the start"} re-sorts onto the remaining school days.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={async () => {
              if (!startDate) return;
              setBusy(true);
              try { await onAdd(startDate, days, name); } finally { setBusy(false); }
            }}
            disabled={busy || !startDate}
          >
            <Plus size={14} />
            Add break
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
