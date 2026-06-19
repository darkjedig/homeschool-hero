import { query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export type Tier = "beginner" | "intermediate" | "advanced";

type TopicRow = {
  topicId: string;
  subjectId: string;
  topicName: string;
  subjectSlug: string;
  avg: number;
  attempts: number;
};

/**
 * Per-topic performance for the current student, derived from lesson quiz
 * attempts (Friday attempts are excluded since they span topics). Uses a
 * rolling average of the last 5 attempts per topic.
 */
export const topicPerformance = query({
  args: {},
  handler: async (ctx): Promise<TopicRow[]> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(200);

    // Group percentage by topic (via quiz → topic), keeping last 5 per topic.
    const byTopic = new Map<
      string,
      { subjectId: string; topicName: string; subjectSlug: string; vals: number[] }
    >();
    for (const a of attempts) {
      if (!a.quizId) continue; // skip Friday attempts
      const quiz = await ctx.db.get(a.quizId);
      if (!quiz || !quiz.topicId) continue;
      const topic = await ctx.db.get(quiz.topicId);
      const subject = quiz.subjectId ? await ctx.db.get(quiz.subjectId) : null;
      const key = quiz.topicId;
      const entry =
        byTopic.get(key) ?? {
          subjectId: quiz.subjectId ?? "",
          topicName: topic?.name ?? "Topic",
          subjectSlug: subject?.slug ?? "",
          vals: [],
        };
      entry.vals.push(a.percentage);
      byTopic.set(key, entry);
    }

    return [...byTopic.entries()].map(([topicId, e]) => {
      const last = e.vals.slice(-5);
      const avg = Math.round(last.reduce((s, v) => s + v, 0) / Math.max(last.length, 1));
      return {
        topicId,
        subjectId: e.subjectId,
        topicName: e.topicName,
        subjectSlug: e.subjectSlug,
        avg,
        attempts: e.vals.length,
      };
    });
  },
});

/**
 * Topics where the student's rolling average is under 70% — the
 * "Recommended Review" list for the dashboard.
 */
export const recommendedReview = query({
  args: {},
  handler: async (ctx): Promise<TopicRow[]> => {
    const rows = await ctx.runQuery(api.adaptive.topicPerformance, {});
    return rows
      .filter((r) => r.attempts > 0 && r.avg < 70)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 6);
  },
});

/**
 * Recommended next difficulty tier for a topic based on recent performance.
 * avg >= 85 → advanced, >= 65 → intermediate, otherwise beginner.
 * No data → beginner.
 */
export const nextDifficulty = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args): Promise<Tier> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return "beginner";

    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(200);

    const vals: number[] = [];
    for (const a of attempts) {
      if (!a.quizId) continue;
      const quiz = await ctx.db.get(a.quizId);
      if (quiz?.topicId === args.topicId) vals.push(a.percentage);
    }
    if (vals.length === 0) return "beginner";
    const last = vals.slice(-5);
    const avg = last.reduce((s, v) => s + v, 0) / last.length;
    if (avg >= 85) return "advanced";
    if (avg >= 65) return "intermediate";
    return "beginner";
  },
});
