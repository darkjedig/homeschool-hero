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
} as const;

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
      .withIndex("by_subject", (q) => q.eq("subjectId", s._id))
      .filter((q) => q.eq(q.field("status"), "published"))
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
    const year = await ctx.db.query("schoolYear").first();
    if (!year) throw new Error("No school year configured. Seed one first.");

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
        await ctx.db.insert("calendarEntries", {
          date,
          slotOrder: slot,
          subjectId,
          lessonId,
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
    const core = [maths, english].filter(Boolean) as Id<"subjects">[];

    const rotation = [
      { dayOfWeek: 1, subjectIds: [...core, science].filter(Boolean) as Id<"subjects">[] },
      { dayOfWeek: 2, subjectIds: [...core, history, aics].filter(Boolean) as Id<"subjects">[] },
      { dayOfWeek: 3, subjectIds: [...core, science].filter(Boolean) as Id<"subjects">[] },
      { dayOfWeek: 4, subjectIds: [...core, history, gamedev].filter(Boolean) as Id<"subjects">[] },
      { dayOfWeek: 5, subjectIds: [...core, homemaking, building].filter(Boolean) as Id<"subjects">[] },
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
  lessonId: string | null;
  lessonTitle: string | null;
  completed: boolean;
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
    if (e.lessonId) {
      const lesson = await ctx.db.get(e.lessonId);
      lessonTitle = lesson?.title ?? null;
      if (userId && lesson) {
        const vp = await ctx.db
          .query("videoProgress")
          .withIndex("by_user_and_lesson", (q) =>
            q.eq("userId", userId).eq("lessonId", e.lessonId!),
          )
          .unique();
        completed = !!vp?.completed;
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
      lessonId: e.lessonId ?? null,
      lessonTitle,
      completed,
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
