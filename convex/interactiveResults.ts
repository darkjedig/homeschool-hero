import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { requireParent } from "./authHelpers";
import type { Id } from "./_generated/dataModel";

/** Points awarded the first time a student completes a given interactive. */
const ENGAGEMENT_POINTS = 5;
const MAX_SCORE_BONUS = 10;

/**
 * Record the result of an interactive lesson activity (quick-check, arena,
 * code lab, simulation, matching, etc). Auth required; ownership is derived
 * server-side from the session. The first completion of each distinct
 * (lesson, block) earns engagement points plus a score-scaled bonus so the
 * gamified economy rewards practice without being farmable on replays.
 */
export const log = mutation({
  args: {
    lessonId: v.id("lessons"),
    blockIndex: v.number(),
    variant: v.string(),
    title: v.string(),
    score: v.optional(v.number()),
    total: v.optional(v.number()),
    detail: v.string(),
    completed: v.boolean(),
  },
  handler: async (ctx, args): Promise<{ pointsEarned: number }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const percentage =
      args.total && args.total > 0 && args.score !== undefined
        ? Math.round((args.score / args.total) * 100)
        : undefined;

    const now = Date.now();
    await ctx.db.insert("interactiveResults", {
      userId,
      lessonId: args.lessonId,
      subjectId: lesson.subjectId,
      blockIndex: args.blockIndex,
      variant: args.variant,
      title: args.title.slice(0, 120),
      score: args.score,
      total: args.total,
      percentage,
      detail: args.detail.slice(0, 600),
      completed: args.completed,
      createdAt: now,
    });

    // Points only on the FIRST completion of this specific activity.
    let pointsEarned = 0;
    if (args.completed) {
      const sourceId = `${args.lessonId}:${args.blockIndex}`;
      const priorInteractive = await ctx.db
        .query("pointsLedger")
        .withIndex("by_user_and_source", (q) =>
          q.eq("userId", userId).eq("sourceType", "interactive"),
        )
        .take(500);
      const alreadyAwarded = priorInteractive.some(
        (p) => p.sourceId === sourceId,
      );
      if (!alreadyAwarded) {
        const bonus =
          percentage !== undefined
            ? Math.round((percentage / 100) * MAX_SCORE_BONUS)
            : 0;
        pointsEarned = ENGAGEMENT_POINTS + bonus;
        await ctx.db.insert("pointsLedger", {
          userId,
          sourceType: "interactive",
          sourceId,
          points: pointsEarned,
          description: `Activity: ${args.title.slice(0, 80)}`,
          createdAt: now,
        });
        await ctx.runMutation(internal.badges.checkAndAward, { userId });
      }
    }

    return { pointsEarned };
  },
});

type ParentResult = {
  _id: Id<"interactiveResults">;
  createdAt: number;
  variant: string;
  title: string;
  detail: string;
  score?: number;
  total?: number;
  percentage?: number;
  completed: boolean;
  lessonId: Id<"lessons">;
  lessonTitle: string;
  subjectName: string;
  subjectColor: string;
};

/**
 * Recent interactive activity across all students (parent-only). Joined with
 * lesson + subject so the dashboard can show what each student actually did.
 */
export const recentForParents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<ParentResult[]> => {
    await requireParent(ctx);
    const limit = Math.min(args.limit ?? 25, 100);
    const rows = await ctx.db
      .query("interactiveResults")
      .order("desc")
      .take(300);
    const top = rows.slice(0, limit);

    const lessonCache = new Map<string, { title: string; subjectId: Id<"subjects"> } | null>();
    const subjectCache = new Map<string, { name: string; color: string } | null>();

    const out: ParentResult[] = [];
    for (const r of top) {
      let lesson = lessonCache.get(r.lessonId);
      if (lesson === undefined) {
        const doc = await ctx.db.get(r.lessonId);
        lesson = doc ? { title: doc.title, subjectId: doc.subjectId } : null;
        lessonCache.set(r.lessonId, lesson);
      }
      let subject = lesson ? subjectCache.get(lesson.subjectId) : null;
      if (lesson && subject === undefined) {
        const doc = await ctx.db.get(lesson.subjectId);
        subject = doc ? { name: doc.name, color: doc.color } : null;
        subjectCache.set(lesson.subjectId, subject);
      }
      out.push({
        _id: r._id,
        createdAt: r.createdAt,
        variant: r.variant,
        title: r.title,
        detail: r.detail,
        score: r.score,
        total: r.total,
        percentage: r.percentage,
        completed: r.completed,
        lessonId: r.lessonId,
        lessonTitle: lesson?.title ?? "—",
        subjectName: subject?.name ?? "—",
        subjectColor: subject?.color ?? "#3b82f6",
      });
    }
    return out;
  },
});

/** All interactive results for a single lesson (parent-only). */
export const forLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const rows = await ctx.db
      .query("interactiveResults")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .take(200);
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});
