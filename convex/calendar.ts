import { query, mutation } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireParent } from "./authHelpers";
import type { Id, Doc } from "./_generated/dataModel";

const SUBJECT_SLUGS = {
  maths: "maths",
  english: "english",
  science: "science",
  history: "history",
  aics: "ai-and-computer-science",
  gamedev: "game-development",
  homemaking: "homemaking",
  building: "building-and-construction",
  geography: "geography",
} as const;

/** Core subjects completed on IXL (uk.ixl.com) — calendar gaps show a note, not "soon". */
const IXL_SLUGS = new Set<string>([
  SUBJECT_SLUGS.maths,
  SUBJECT_SLUGS.english,
  SUBJECT_SLUGS.science,
]);

function ixlLabel(subjectName: string): string {
  return `IXL ${subjectName} Lesson`;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function parseISO(s: string): Date {
  return new Date(s + "T00:00:00Z");
}

/** The single school-year doc (or null). */
export const getSchoolYear = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("schoolYear").first();
  },
});

/** Ordered published lesson ids per subject (topic order → creation time). */
async function orderedLessonsBySubject(
  ctx: MutationCtx,
): Promise<Map<Id<"subjects">, Id<"lessons">[]>> {
  const map = new Map<Id<"subjects">, Id<"lessons">[]>();
  const subjects = await ctx.db.query("subjects").take(50);
  for (const s of subjects) {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_subject_and_status", (q) =>
        q.eq("subjectId", s._id).eq("status", "published"),
      )
      .take(300);
    const topics = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", s._id))
      .take(100);
    const topicOrder = new Map<Id<"topics">, number>(
      topics.map((t) => [t._id, t.order]),
    );
    lessons.sort(
      (a, b) =>
        (topicOrder.get(a.topicId) ?? 0) - (topicOrder.get(b.topicId) ?? 0) ||
        a._creationTime - b._creationTime,
    );
    map.set(s._id, lessons.map((l) => l._id));
  }
  return map;
}

function inHoliday(date: Date, holidays: { name: string; start: string; end: string }[]): boolean {
  const iso = toISO(date);
  return holidays.some((h) => iso >= h.start && iso <= h.end);
}

/**
 * The standard weekly rotation. Maths, English and Science each appear exactly
 * 3×/week (not daily) so the calendar doesn't lean too hard on IXL labels:
 *   Mon: Maths, English, Science
 *   Tue: Maths, English, History, AI&CS
 *   Wed: Science, Geography, History
 *   Thu: Maths, English, Homemaking
 *   Fri: Science, GameDev, Building
 * Missing subjects are filtered out, so it works even before all exist.
 */
async function buildStandardRotation(
  ctx: MutationCtx,
): Promise<{ dayOfWeek: number; subjectIds: Id<"subjects">[] }[]> {
  const bySlug = async (slug: string) =>
    (
      await ctx.db
        .query("subjects")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique()
    )?._id;
  const f = (arr: (Id<"subjects"> | undefined)[]) =>
    arr.filter((x): x is Id<"subjects"> => x !== undefined);
  const [maths, english, science, history, aics, gamedev, homemaking, building, geography] =
    await Promise.all([
      bySlug(SUBJECT_SLUGS.maths),
      bySlug(SUBJECT_SLUGS.english),
      bySlug(SUBJECT_SLUGS.science),
      bySlug(SUBJECT_SLUGS.history),
      bySlug(SUBJECT_SLUGS.aics),
      bySlug(SUBJECT_SLUGS.gamedev),
      bySlug(SUBJECT_SLUGS.homemaking),
      bySlug(SUBJECT_SLUGS.building),
      bySlug(SUBJECT_SLUGS.geography),
    ]);
  return [
    { dayOfWeek: 1, subjectIds: f([maths, english, science]) },
    { dayOfWeek: 2, subjectIds: f([maths, english, history, aics]) },
    { dayOfWeek: 3, subjectIds: f([science, geography, history]) },
    { dayOfWeek: 4, subjectIds: f([maths, english, homemaking]) },
    { dayOfWeek: 5, subjectIds: f([science, gamedev, building]) },
  ];
}

/**
 * Generate the calendar entries for the school year. Idempotent per call:
 * clears existing entries, then walks each school day (Mon–Fri, skipping
 * weekends + holidays), assigning the next lesson per subject per the rotation.
 * Parent-only.
 */
export const generateYear = mutation({
  args: {},
  handler: async (ctx) => {
    // TODO(Phase 10 RBAC): requireParent — currently ungated for CLI setup;
    // parent calendar UI is protected by the ParentGate component.
    let year = await ctx.db.query("schoolYear").first();
    if (!year) throw new Error("No school year configured. Seed one first.");

    // Enforce the standard rotation: Maths/English/Science each max 3×/week
    // (not daily) so the calendar doesn't lean too hard on IXL labels.
    const rotation = await buildStandardRotation(ctx);
    if (JSON.stringify(rotation) !== JSON.stringify(year.rotation)) {
      await ctx.db.patch(year._id, { rotation, updatedAt: Date.now() });
      year = { ...year, rotation };
    }

    const subjects = await ctx.db.query("subjects").take(50);
    const subjectById = new Map(subjects.map((s) => [s._id, s]));

    const lessonsBySubject = await orderedLessonsBySubject(ctx);
    const pointer = new Map<string, number>();

    // Clear existing entries.
    const old = await ctx.db.query("calendarEntries").take(5000);
    for (const e of old) await ctx.db.delete(e._id);

    const weekdays = new Set(year.weekdays);
    const start = parseISO(year.startDate);
    const end = parseISO(year.endDate);
    const firstWeekday = Math.min(...year.weekdays);
    let weekIndex = 0;
    let entries = 0;
    const seenAnySchoolDay = new Set<number>();

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const dow = d.getUTCDay();
      if (!weekdays.has(dow)) continue;
      if (inHoliday(d, year.holidays)) continue;
      if (dow === firstWeekday && seenAnySchoolDay.size > 0) weekIndex += 1;
      seenAnySchoolDay.add(dow);

      const rot = year.rotation.find((r) => r.dayOfWeek === dow);
      if (!rot) continue;
      const date = toISO(d);
      let slot = 0;
      for (const subjectId of rot.subjectIds) {
        const list = lessonsBySubject.get(subjectId) ?? [];
        const idx = pointer.get(subjectId) ?? 0;
        const lessonId = idx < list.length ? list[idx] : undefined;
        if (idx < list.length) pointer.set(subjectId, idx + 1);

        const subject = subjectById.get(subjectId);
        let label: string | undefined;
        if (!lessonId && subject && IXL_SLUGS.has(subject.slug)) {
          label = ixlLabel(subject.name);
        }

        await ctx.db.insert("calendarEntries", {
          date,
          slotOrder: slot,
          subjectId,
          lessonId,
          label,
          weekIndex,
        });
        slot += 1;
        entries += 1;
      }
    }
    return { entries, weeks: weekIndex + 1 };
  },
});

/**
 * Seed a default US-style school year (Aug→June, Mon–Fri) with editable
 * holidays + a core-heavy rotation. Parent-only. Idempotent.
 */
export const seedDefaultYear = mutation({
  args: { startYear: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // TODO(Phase 10 RBAC): requireParent — one-off seed, ungated for CLI setup.
    const existing = await ctx.db.query("schoolYear").first();
    if (existing) return existing._id;

    const y = args.startYear ?? new Date().getFullYear();
    const bySlug = async (slug: string) =>
      (await ctx.db.query("subjects").withIndex("by_slug", (q) => q.eq("slug", slug)).unique())?._id;

    const maths = await bySlug(SUBJECT_SLUGS.maths);
    const english = await bySlug(SUBJECT_SLUGS.english);
    const science = await bySlug(SUBJECT_SLUGS.science);
    const history = await bySlug(SUBJECT_SLUGS.history);
    const aics = await bySlug(SUBJECT_SLUGS.aics);
    const gamedev = await bySlug(SUBJECT_SLUGS.gamedev);
    const homemaking = await bySlug(SUBJECT_SLUGS.homemaking);
    const building = await bySlug(SUBJECT_SLUGS.building);
    const geography = await bySlug(SUBJECT_SLUGS.geography);
    const f = (arr: (Id<"subjects"> | undefined)[]) =>
      arr.filter((x): x is Id<"subjects"> => x !== undefined);

    // Maths/English/Science each 3×/week (not daily).
    const rotation = [
      { dayOfWeek: 1, subjectIds: f([maths, english, science]) },
      { dayOfWeek: 2, subjectIds: f([maths, english, history, aics]) },
      { dayOfWeek: 3, subjectIds: f([science, geography, history]) },
      { dayOfWeek: 4, subjectIds: f([maths, english, homemaking]) },
      { dayOfWeek: 5, subjectIds: f([science, gamedev, building]) },
    ];

    const now = Date.now();
    return await ctx.db.insert("schoolYear", {
      name: `${y}-${y + 1} School Year`,
      startDate: `${y}-08-25`,
      endDate: `${y + 1}-06-10`,
      weekdays: [1, 2, 3, 4, 5],
      holidays: [
        { name: "Labor Day", start: `${y}-09-01`, end: `${y}-09-01` },
        { name: "Thanksgiving Break", start: `${y}-11-26`, end: `${y}-11-28` },
        { name: "Winter Break", start: `${y}-12-22`, end: `${y + 1}-01-02` },
        { name: "MLK Day", start: `${y + 1}-01-19`, end: `${y + 1}-01-19` },
        { name: "Presidents Day", start: `${y + 1}-02-16`, end: `${y + 1}-02-16` },
        { name: "Spring Break", start: `${y + 1}-03-30`, end: `${y + 1}-04-03` },
        { name: "Memorial Day", start: `${y + 1}-05-25`, end: `${y + 1}-05-25` },
      ],
      rotation,
      createdAt: now,
      updatedAt: now,
    });
  },
});

type EntryView = {
  _id: string;
  date: string;
  slotOrder: number;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  subjectSlug: string;
  subjectIcon: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
  label: string | null;
  completed: boolean;
  points: number | null;
  progress: number | null;
  weekIndex: number;
};

async function enrich(
  ctx: QueryCtx,
  entries: Doc<"calendarEntries">[],
  userId: Id<"users"> | null,
): Promise<EntryView[]> {
  const subjects = await ctx.db.query("subjects").take(50);
  const subjectById = new Map<Id<"subjects">, Doc<"subjects">>(
    subjects.map((s) => [s._id, s]),
  );
  const out: EntryView[] = [];
  for (const e of entries) {
    const subject = subjectById.get(e.subjectId);
    let lessonTitle: string | null = null;
    let completed = false;
    let points: number | null = null;
    let progress: number | null = null;
    if (e.lessonId) {
      const lesson = await ctx.db.get(e.lessonId);
      lessonTitle = lesson?.title ?? null;
      points = lesson?.pointsAwarded ?? null;
      if (userId && lesson) {
        const vp = await ctx.db
          .query("videoProgress")
          .withIndex("by_user_and_lesson", (q) =>
            q.eq("userId", userId).eq("lessonId", e.lessonId!),
          )
          .unique();
        completed = !!vp?.completed;
        progress = vp ? (vp.completed ? 100 : Math.round(vp.percentageWatched)) : null;
      }
    }
    out.push({
      _id: e._id,
      date: e.date,
      slotOrder: e.slotOrder,
      subjectId: e.subjectId,
      subjectName: subject?.name ?? "Subject",
      subjectColor: subject?.color ?? "#3b82f6",
      subjectSlug: subject?.slug ?? "",
      subjectIcon: subject?.icon ?? null,
      lessonId: e.lessonId ?? null,
      lessonTitle,
      label: e.label ?? null,
      completed,
      points,
      progress,
      weekIndex: e.weekIndex,
    });
  }
  return out.sort((a, b) => a.slotOrder - b.slotOrder);
}

/** Today's planned lessons with completion status. */
export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const today = toISO(new Date());
    const entries = await ctx.db
      .query("calendarEntries")
      .withIndex("by_date", (q) => q.eq("date", today))
      .take(20);
    return await enrich(ctx, entries, userId);
  },
});

/** A week of entries (Mon–Sun) around the given date (yyyy-mm-dd). */
export const getWeek = query({
  args: { around: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const ref = args.around ? parseISO(args.around) : new Date();
    const dow = ref.getUTCDay();
    const monday = new Date(ref);
    monday.setUTCDate(ref.getUTCDate() - ((dow + 6) % 7));
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      dates.push(toISO(d));
    }
    const out: Record<string, EntryView[]> = {};
    for (const date of dates) {
      const entries = await ctx.db
        .query("calendarEntries")
        .withIndex("by_date", (q) => q.eq("date", date))
        .take(20);
      out[date] = await enrich(ctx, entries, userId);
    }
    return { dates, days: out };
  },
});

/** A full month of entries grouped by date (for month-grid view). */
export const getMonth = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const firstDay = new Date(Date.UTC(args.year, args.month, 1));
    const lastDay = new Date(Date.UTC(args.year, args.month + 1, 0));
    const dates: string[] = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setUTCDate(d.getUTCDate() + 1)) {
      dates.push(toISO(d));
    }
    const days: Record<string, EntryView[]> = {};
    for (const date of dates) {
      const entries = await ctx.db
        .query("calendarEntries")
        .withIndex("by_date", (q) => q.eq("date", date))
        .take(20);
      days[date] = await enrich(ctx, entries, userId);
    }
    return { dates, days };
  },
});

/** Assign a specific lesson to a calendar entry (parent). */
export const assignLesson = mutation({
  args: { entryId: v.id("calendarEntries"), lessonId: v.optional(v.id("lessons")) },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    await ctx.db.patch(args.entryId, { lessonId: args.lessonId });
  },
});

/** Clear the lesson from a calendar entry (parent). */
export const clearEntry = mutation({
  args: { entryId: v.id("calendarEntries") },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    await ctx.db.patch(args.entryId, { lessonId: undefined });
  },
});

/**
 * Re-lay every calendar entry from `startDate` onward onto the remaining
 * school days (skipping weekends + all holidays), preserving each subject's
 * current lesson order. Used by addBreak/removeBreak/regenerateFrom so a break
 * shifts lessons past it instead of deleting them — keeping each subject's
 * sequence (e.g. a WW1 unit) intact. Entries before `startDate` are untouched.
 *
 * Mirrors generateYear's rotation + weekIndex logic but pulls lessons from the
 * existing calendar order rather than the curriculum order.
 */
async function relayFrom(ctx: MutationCtx, startDate: string): Promise<void> {
  let year = await ctx.db.query("schoolYear").first();
  if (!year) throw new Error("No school year configured. Seed one first.");

  // Force the standard rotation (same as generateYear) for consistency.
  const rotation = await buildStandardRotation(ctx);
  if (JSON.stringify(rotation) !== JSON.stringify(year.rotation)) {
    await ctx.db.patch(year._id, { rotation, updatedAt: Date.now() });
    year = { ...year, rotation };
  }

  const subjects = await ctx.db.query("subjects").take(50);
  const subjectById = new Map(subjects.map((s) => [s._id, s]));

  // Gather the entries we are about to move, grouped per subject in their
  // current display order (date, then slotOrder) so per-subject sequence is
  // preserved exactly.
  const affected = await ctx.db
    .query("calendarEntries")
    .withIndex("by_date", (q) => q.gte("date", startDate))
    .take(5000);
  const ordered = affected
    .slice()
    .sort((a, b) =>
      a.date === b.date ? a.slotOrder - b.slotOrder : a.date < b.date ? -1 : 1,
    );
  const queues = new Map<
    Id<"subjects">,
    { lessonId?: Id<"lessons">; label?: string }[]
  >();
  for (const e of ordered) {
    const q = queues.get(e.subjectId) ?? [];
    q.push({ lessonId: e.lessonId, label: e.label });
    queues.set(e.subjectId, q);
  }
  for (const e of affected) await ctx.db.delete(e._id);

  const queuesRemaining = () => {
    for (const q of queues.values()) {
      if (q.length > 0) return true;
    }
    return false;
  };

  // Walk the whole year so weekIndex stays consistent with generateYear, but
  // only re-insert entries on/after startDate (earlier entries are untouched).
  // If a break pushed lessons past the original end date, keep walking school
  // days until every queued lesson is placed — never drop curriculum.
  const weekdays = new Set(year.weekdays);
  const firstWeekday = Math.min(...year.weekdays);
  const start = parseISO(year.startDate);
  const origEnd = parseISO(year.endDate);
  const hardCap = new Date(origEnd);
  hardCap.setUTCDate(origEnd.getUTCDate() + 90);
  let weekIndex = 0;
  let seenAnySchoolDay = false;
  let lastPlaced = year.endDate;

  for (let d = new Date(start); d <= hardCap; d.setUTCDate(d.getUTCDate() + 1)) {
    const pastOrigEnd = d > origEnd;
    if (pastOrigEnd && !queuesRemaining()) break;

    const dow = d.getUTCDay();
    if (!weekdays.has(dow)) continue;
    if (inHoliday(d, year.holidays)) continue;
    if (dow === firstWeekday && seenAnySchoolDay) weekIndex += 1;
    seenAnySchoolDay = true;

    const date = toISO(d);
    if (date < startDate) continue;

    const rot = year.rotation.find((r) => r.dayOfWeek === dow);
    if (!rot) continue;
    let slot = 0;
    for (const subjectId of rot.subjectIds) {
      const queue = queues.get(subjectId);
      const next = queue?.shift();
      if (next) {
        await ctx.db.insert("calendarEntries", {
          date,
          slotOrder: slot,
          subjectId,
          lessonId: next.lessonId,
          label: next.label,
          weekIndex,
        });
        lastPlaced = date;
      } else if (!pastOrigEnd) {
        // Subject ran out of lessons: keep an IXL placeholder for core subjects
        // (matches generateYear) so the slot reads as a planned day, not empty.
        const subject = subjectById.get(subjectId);
        if (subject && IXL_SLUGS.has(subject.slug)) {
          await ctx.db.insert("calendarEntries", {
            date,
            slotOrder: slot,
            subjectId,
            lessonId: undefined,
            label: ixlLabel(subject.name),
            weekIndex,
          });
        }
      }
      slot += 1;
    }
  }

  if (lastPlaced > year.endDate) {
    await ctx.db.patch(year._id, { endDate: lastPlaced, updatedAt: Date.now() });
  }
}

/**
 * Delay the first lesson day without deleting any scheduled lessons. Marks
 * `year.startDate` through the day before `firstLessonDate` as a "Late start"
 * break, then re-lays every existing calendar lesson onto remaining school
 * days in the same per-subject order (so WWI still comes before WWII, etc.).
 * Extends `endDate` if the shift would otherwise drop lessons off the year.
 * Idempotent if the late-start holiday already exists. Ungated for CLI setup.
 */
export const delayStartTo = mutation({
  args: { firstLessonDate: v.string() },
  handler: async (ctx, args) => {
    const year = await ctx.db.query("schoolYear").first();
    if (!year) throw new Error("No school year configured. Seed one first.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.firstLessonDate)) {
      throw new Error("firstLessonDate must be yyyy-mm-dd.");
    }
    if (args.firstLessonDate <= year.startDate) {
      throw new Error("firstLessonDate must be after the school-year start.");
    }

    const lateEnd = (() => {
      const d = parseISO(args.firstLessonDate);
      d.setUTCDate(d.getUTCDate() - 1);
      return toISO(d);
    })();

    const holidays = year.holidays.filter((h) => h.name !== "Late start");
    holidays.push({
      name: "Late start",
      start: year.startDate,
      end: lateEnd,
    });
    await ctx.db.patch(year._id, { holidays, updatedAt: Date.now() });

    await relayFrom(ctx, year.startDate);

    const updated = await ctx.db.get(year._id);
    return {
      firstLessonDate: args.firstLessonDate,
      lateStart: { start: year.startDate, end: lateEnd },
      endDate: updated?.endDate ?? year.endDate,
    };
  },
});

/**
 * Swap the lessons between two calendar entries (parent). Drag-and-drop: drop
 * a lesson onto another day's slot and the two trade places. If the target slot
 * was empty, the lesson simply moves there and the source is cleared.
 */
export const moveLesson = mutation({
  args: {
    sourceEntryId: v.id("calendarEntries"),
    targetEntryId: v.id("calendarEntries"),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const [src, tgt] = await Promise.all([
      ctx.db.get(args.sourceEntryId),
      ctx.db.get(args.targetEntryId),
    ]);
    if (!src || !tgt) throw new Error("Calendar entry not found.");
    await ctx.db.patch(src._id, { lessonId: tgt.lessonId, label: tgt.label });
    await ctx.db.patch(tgt._id, { lessonId: src.lessonId, label: src.label });
  },
});

/**
 * Block out a break (holiday). Persists the range on the school year, then
 * re-lays every lesson from the break's start onward so the lessons that would
 * have fallen in the break move past it in order, filling the remaining school
 * days. Parent-only.
 */
export const addBreak = mutation({
  args: {
    startDate: v.string(),
    days: v.number(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    if (args.days < 1) throw new Error("A break must be at least 1 day.");
    const year = await ctx.db.query("schoolYear").first();
    if (!year) throw new Error("No school year configured. Seed one first.");

    const startD = parseISO(args.startDate);
    const endD = new Date(startD);
    endD.setUTCDate(startD.getUTCDate() + args.days - 1);
    const end = toISO(endD);

    const holidays = [
      ...year.holidays,
      { name: args.name?.trim() || "Break", start: args.startDate, end },
    ];
    await ctx.db.patch(year._id, { holidays, updatedAt: Date.now() });
    await relayFrom(ctx, args.startDate);
    return { start: args.startDate, end };
  },
});

/**
 * Remove a saved break/holiday by index, then close the gap by re-laying
 * lessons from its start. Parent-only.
 */
export const removeBreak = mutation({
  args: { index: v.number() },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const year = await ctx.db.query("schoolYear").first();
    if (!year) throw new Error("No school year configured. Seed one first.");
    if (args.index < 0 || args.index >= year.holidays.length) {
      throw new Error("Invalid break.");
    }
    const removed = year.holidays[args.index];
    const holidays = year.holidays.filter((_, i) => i !== args.index);
    await ctx.db.patch(year._id, { holidays, updatedAt: Date.now() });
    await relayFrom(ctx, removed.start);
    return removed;
  },
});

/**
 * Re-sort the calendar from a given date onward, preserving each subject's
 * current lesson order. Useful after manual edits to re-tidy the tail without a
 * full regenerate. Parent-only.
 */
export const regenerateFrom = mutation({
  args: { startDate: v.string() },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    await relayFrom(ctx, args.startDate);
  },
});

/**
 * Published lessons grouped by subject, for the "add/change lesson" picker in
 * the calendar editor. Parent-only.
 */
export const pickerLessons = query({
  args: { subjectId: v.optional(v.id("subjects")) },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const subjects = args.subjectId
      ? [await ctx.db.get(args.subjectId)].filter(
          (s): s is Doc<"subjects"> => s !== null,
        )
      : await ctx.db.query("subjects").take(50);
    const out = [];
    for (const s of subjects) {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_subject_and_status", (q) =>
          q.eq("subjectId", s._id).eq("status", "published"),
        )
        .take(300);
      out.push({
        subjectId: s._id,
        subjectName: s.name,
        subjectColor: s.color,
        subjectSlug: s.slug,
        lessons: lessons.map((l) => ({
          _id: l._id,
          title: l.title,
          topicId: l.topicId,
        })),
      });
    }
    return out;
  },
});
