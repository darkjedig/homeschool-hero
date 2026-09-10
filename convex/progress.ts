import { query, mutation, internalMutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { householdStudentUserId, requireParent } from "./authHelpers";
import { loadCompletion, markLessonsComplete } from "./lib/completion";
import type { LessonActivity } from "./lib/completion";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type LessonRow = {
  lessonId: Id<"lessons">;
  lessonTitle: string;
  subjectName: string;
  subjectColor: string;
  subjectSlug: string;
  videoDone: boolean;
  videoPct: number | null;
  quizDone: boolean;
  quizPct: number | null;
  interactiveDone: boolean;
  interactiveCount: number;
  marked: boolean;
  lastAt: number;
};

type TodayRow = {
  lessonId: Id<"lessons"> | null;
  lessonTitle: string;
  subjectName: string;
  subjectColor: string;
  subjectSlug: string;
  videoDone: boolean;
  quizDone: boolean;
  interactiveDone: boolean;
  completed: boolean;
};

async function completeCalendarDate(
  ctx: MutationCtx,
  studentId: Id<"users">,
  date: string,
) {
  if (!ISO_DATE.test(date)) throw new Error("Date must be yyyy-mm-dd");
  const entries = await ctx.db
    .query("calendarEntries")
    .withIndex("by_date", (q) => q.eq("date", date))
    .take(20);
  const lessonIds = entries
    .map((e) => e.lessonId)
    .filter((id): id is Id<"lessons"> => id !== undefined);
  const result = await markLessonsComplete(
    ctx,
    studentId,
    lessonIds,
    "parent",
    date,
  );
  await ctx.runMutation(internal.badges.checkAndAward, { userId: studentId });
  return { ...result, slots: lessonIds.length, date };
}

async function mapLesson(
  ctx: QueryCtx | MutationCtx,
  row: LessonActivity,
  subjects: { _id: Id<"subjects">; name: string; color: string; slug: string }[],
): Promise<LessonRow> {
  const lesson = await ctx.db.get(row.lessonId);
  const subject = lesson
    ? subjects.find((s) => s._id === lesson.subjectId)
    : undefined;
  return {
    lessonId: row.lessonId,
    lessonTitle: lesson?.title ?? "Lesson",
    subjectName: subject?.name ?? "Subject",
    subjectColor: subject?.color ?? "#3b82f6",
    subjectSlug: subject?.slug ?? "",
    videoDone: row.videoDone,
    videoPct: row.videoPct,
    quizDone: row.quizDone,
    quizPct: row.quizPct,
    interactiveDone: row.interactiveDone,
    interactiveCount: row.interactiveCount,
    marked: row.marked,
    lastAt: row.lastAt,
  };
}

/** Video watch logs + chart series for the parent Videos page. */
export const videos = query({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    const studentId = await householdStudentUserId(ctx);
    let rows = studentId
      ? await ctx.db
          .query("videoProgress")
          .withIndex("by_user", (q) => q.eq("userId", studentId))
          .take(200)
      : [];
    if (rows.length === 0) {
      rows = await ctx.db.query("videoProgress").take(200);
    }
    const sorted = rows.slice().sort((a, b) => b.updatedAt - a.updatedAt);
    const subjectCache = new Map<
      string,
      { name: string; color: string; slug: string } | null
    >();
    const videos = [];
    for (const row of sorted) {
      const lesson = await ctx.db.get(row.lessonId);
      let subjectName: string | null = null;
      let subjectColor: string | null = null;
      let subjectSlug: string | null = null;
      if (lesson) {
        let subject = subjectCache.get(lesson.subjectId);
        if (subject === undefined) {
          const doc = await ctx.db.get(lesson.subjectId);
          subject = doc
            ? { name: doc.name, color: doc.color, slug: doc.slug }
            : null;
          subjectCache.set(lesson.subjectId, subject);
        }
        subjectName = subject?.name ?? null;
        subjectColor = subject?.color ?? null;
        subjectSlug = subject?.slug ?? null;
      }
      videos.push({
        progressId: row._id,
        lessonId: row.lessonId,
        lessonTitle: lesson?.title ?? "Lesson",
        subjectName,
        subjectColor,
        subjectSlug,
        secondsWatched: row.secondsWatched,
        durationSeconds: row.durationSeconds ?? null,
        percentageWatched: row.percentageWatched,
        completed: row.completed,
        updatedAt: row.updatedAt,
      });
    }

    const bySubjectMap = new Map<
      string,
      { name: string; color: string; seconds: number; finished: number; started: number }
    >();
    for (const v of videos) {
      const key = v.subjectSlug ?? "other";
      const cur = bySubjectMap.get(key) ?? {
        name: v.subjectName ?? "Other",
        color: v.subjectColor ?? "#06b6d4",
        seconds: 0,
        finished: 0,
        started: 0,
      };
      cur.seconds += v.secondsWatched;
      cur.started += 1;
      if (v.completed) cur.finished += 1;
      bySubjectMap.set(key, cur);
    }

    return {
      videos,
      bySubject: [...bySubjectMap.entries()].map(([slug, s]) => ({
        slug,
        ...s,
      })),
      totals: {
        started: videos.length,
        finished: videos.filter((v) => v.completed).length,
        seconds: videos.reduce((s, v) => s + v.secondsWatched, 0),
        avgPct:
          videos.length > 0
            ? Math.round(
                videos.reduce((s, v) => s + v.percentageWatched, 0) /
                  videos.length,
              )
            : 0,
      },
    };
  },
});

/** Lesson completion (video + quiz + interactive + parent mark). */
export const forParent = query({
  args: { today: v.string() },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const studentId = await householdStudentUserId(ctx);
    if (!studentId) {
      return {
        counts: { completed: 0, video: 0, quiz: 0, interactive: 0 },
        bySubject: [] as {
          slug: string;
          name: string;
          color: string;
          completed: number;
        }[],
        lessons: [] as LessonRow[],
        today: [] as TodayRow[],
      };
    }

    const [index, subjects, todayEntries] = await Promise.all([
      loadCompletion(ctx, studentId),
      ctx.db.query("subjects").withIndex("by_active_order").take(50),
      ISO_DATE.test(args.today)
        ? ctx.db
            .query("calendarEntries")
            .withIndex("by_date", (q) => q.eq("date", args.today))
            .take(20)
        : Promise.resolve([]),
    ]);

    const lessons: LessonRow[] = [];
    for (const row of index.byLesson.values()) {
      if (!row.completed) continue;
      lessons.push(await mapLesson(ctx, row, subjects));
    }
    lessons.sort((a, b) => b.lastAt - a.lastAt);

    const bySubjectCount = new Map<string, number>();
    for (const l of lessons) {
      bySubjectCount.set(
        l.subjectSlug,
        (bySubjectCount.get(l.subjectSlug) ?? 0) + 1,
      );
    }

    const today: TodayRow[] = [];
    for (const e of todayEntries
      .slice()
      .sort((a, b) => a.slotOrder - b.slotOrder)) {
      const subject = subjects.find((s) => s._id === e.subjectId);
      const activity = e.lessonId ? index.byLesson.get(e.lessonId) : undefined;
      let title = e.lessonTitle ?? e.label ?? "Lesson";
      if (!e.lessonTitle && e.lessonId) {
        const lesson = await ctx.db.get("lessons", e.lessonId);
        if (lesson) title = lesson.title;
      }
      today.push({
        lessonId: e.lessonId ?? null,
        lessonTitle: title,
        subjectName: subject?.name ?? "Subject",
        subjectColor: subject?.color ?? "#3b82f6",
        subjectSlug: subject?.slug ?? "",
        videoDone: activity?.videoDone ?? false,
        quizDone: activity?.quizDone ?? false,
        interactiveDone: activity?.interactiveDone ?? false,
        completed: activity?.completed ?? false,
      });
    }

    return {
      counts: {
        completed: index.completedIds.size,
        video: [...index.byLesson.values()].filter((r) => r.videoDone).length,
        quiz: [...index.byLesson.values()].filter((r) => r.quizDone).length,
        interactive: [...index.byLesson.values()].filter((r) => r.interactiveDone)
          .length,
      },
      bySubject: subjects.map((s) => ({
        slug: s.slug,
        name: s.name,
        color: s.color,
        completed: bySubjectCount.get(s.slug) ?? 0,
      })),
      lessons,
      today,
    };
  },
});

/** Parent marks every planned lesson on a calendar date complete. */
export const markDateComplete = mutation({
  args: { date: v.string() },
  returns: v.object({
    marked: v.number(),
    titles: v.array(v.string()),
    slots: v.number(),
    date: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const studentId = await householdStudentUserId(ctx);
    if (!studentId) throw new Error("No student account on this household");
    return await completeCalendarDate(ctx, studentId, args.date);
  },
});

/** CLI / trusted backend: same as markDateComplete without a parent session. */
export const completeDate = internalMutation({
  args: { date: v.string() },
  returns: v.object({
    marked: v.number(),
    titles: v.array(v.string()),
    slots: v.number(),
    date: v.string(),
  }),
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("familyAccounts")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .unique();
    if (!account?.userId) throw new Error("No student account");
    return await completeCalendarDate(ctx, account.userId, args.date);
  },
});
