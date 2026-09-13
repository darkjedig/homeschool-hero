import { internalQuery, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getProfile, householdStudentUserId } from "./authHelpers";
import { loadCompletion } from "./lib/completion";
import type { Id } from "./_generated/dataModel";

async function studentScope(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const profile = await getProfile(ctx);
  if (!profile) return null;
  if (profile.role === "parent") {
    return await householdStudentUserId(ctx);
  }
  return profile.userId;
}

function toISO(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

const lessonSlot = v.object({
  subjectName: v.string(),
  title: v.string(),
  completed: v.boolean(),
  date: v.string(),
});

export const getTodaysLessons = internalQuery({
  args: { now: v.number() },
  returns: v.array(lessonSlot),
  handler: async (ctx, args) => {
    return await lessonsOnDate(ctx, toISO(args.now));
  },
});

export const getLessonsForDate = internalQuery({
  args: { date: v.string() },
  returns: v.array(lessonSlot),
  handler: async (ctx, args) => {
    return await lessonsOnDate(ctx, args.date);
  },
});

async function lessonsOnDate(ctx: QueryCtx, date: string) {
  const userId = await studentScope(ctx);
  const entries = await ctx.db
    .query("calendarEntries")
    .withIndex("by_date", (q) => q.eq("date", date))
    .take(20);
  const subjects = await ctx.db.query("subjects").withIndex("by_active_order").take(50);
  const subjectById = new Map(subjects.map((s) => [s._id, s]));
  const completed = userId ? (await loadCompletion(ctx, userId)).completedIds : new Set<Id<"lessons">>();
  const out: { subjectName: string; title: string; completed: boolean; date: string }[] = [];
  for (const entry of entries) {
    const subject = subjectById.get(entry.subjectId);
    const title = entry.lessonTitle || entry.label || subject?.name || "Lesson";
    out.push({
      subjectName: subject?.name ?? "Subject",
      title,
      completed: entry.lessonId ? completed.has(entry.lessonId) : false,
      date: entry.date,
    });
  }
  return out;
}

export const getSubjectProgress = internalQuery({
  args: { subject: v.optional(v.string()) },
  returns: v.array(
    v.object({
      topicName: v.string(),
      subjectSlug: v.string(),
      avg: v.number(),
      attempts: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await studentScope(ctx);
    if (!userId) return [];
    const needle = args.subject?.trim().toLowerCase() ?? "";
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(80);
    const byTopic = new Map<
      string,
      { topicName: string; subjectSlug: string; vals: number[] }
    >();
    for (const a of attempts) {
      if (!a.quizId) continue;
      const quiz = await ctx.db.get(a.quizId);
      if (!quiz?.topicId) continue;
      const topic = await ctx.db.get(quiz.topicId);
      const subject = quiz.subjectId ? await ctx.db.get(quiz.subjectId) : null;
      const subjectName = subject?.name ?? "";
      const slug = subject?.slug ?? "";
      if (
        needle &&
        !subjectName.toLowerCase().includes(needle) &&
        !slug.toLowerCase().includes(needle)
      ) {
        continue;
      }
      const key = quiz.topicId;
      const entry =
        byTopic.get(key) ?? {
          topicName: topic?.name ?? "Topic",
          subjectSlug: slug,
          vals: [],
        };
      entry.vals.push(a.percentage);
      byTopic.set(key, entry);
    }
    return [...byTopic.values()].map((e) => {
      const last = e.vals.slice(-5);
      return {
        topicName: e.topicName,
        subjectSlug: e.subjectSlug,
        avg: Math.round(last.reduce((s, n) => s + n, 0) / Math.max(last.length, 1)),
        attempts: e.vals.length,
      };
    });
  },
});

export const getRecentQuizResults = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      title: v.string(),
      subjectName: v.string(),
      percentage: v.number(),
      kind: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await studentScope(ctx);
    if (!userId) return [];
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(8);
    const out: { title: string; subjectName: string; percentage: number; kind: string }[] = [];
    for (const a of attempts) {
      if (a.quizId) {
        const quiz = await ctx.db.get(a.quizId);
        const subject = quiz?.subjectId ? await ctx.db.get(quiz.subjectId) : null;
        out.push({
          title: quiz?.title ?? "Quiz",
          subjectName: subject?.name ?? "Subject",
          percentage: a.percentage,
          kind: "lesson",
        });
      } else if (a.fridayQuizId) {
        const friday = await ctx.db.get(a.fridayQuizId);
        out.push({
          title: friday?.title ?? "Friday Challenge",
          subjectName: "Friday Challenge",
          percentage: a.percentage,
          kind: "friday",
        });
      }
    }
    return out;
  },
});
