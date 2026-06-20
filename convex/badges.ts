import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

// Badge definitions. `key` ties a badge doc to its criteria check below.
const BADGE_DEFS: {
  key: string;
  title: string;
  description: string;
  icon: string;
  criteria: string;
  pointsBonus: number;
}[] = [
  { key: "first_lesson", title: "First Steps", description: "Completed your first lesson.", icon: "PlayCircle", criteria: "Complete 1 lesson", pointsBonus: 50 },
  { key: "quiz_5", title: "Quiz Whiz", description: "Completed 5 quizzes.", icon: "ListChecks", criteria: "Complete 5 quiz attempts", pointsBonus: 100 },
  { key: "perfect_score", title: "Perfect Score", description: "Got 100% on a quiz.", icon: "Star", criteria: "Score 100% on any quiz", pointsBonus: 100 },
  { key: "science_3", title: "Science Star", description: "Completed 3 Science lessons.", icon: "FlaskConical", criteria: "Complete 3 Science lessons", pointsBonus: 100 },
  { key: "points_500", title: "High Scorer", description: "Earned 500 points.", icon: "Trophy", criteria: "Earn 500 points total", pointsBonus: 100 },
  { key: "friday_first", title: "Friday Challenger", description: "Took your first Friday Challenge.", icon: "Swords", criteria: "Finish a Friday Challenge", pointsBonus: 120 },
];

/** Seed the standard badges (idempotent). Parent-only. */
export const seedBadges = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let created = 0;
    for (const def of BADGE_DEFS) {
      const existing = await ctx.db
        .query("badges")
        .withIndex("by_key", (q) => q.eq("key", def.key))
        .unique();
      if (existing) continue;
      await ctx.db.insert("badges", { ...def, active: true, createdAt: now });
      created += 1;
    }
    return { created };
  },
});

/** All active badges (for the achievements display). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("badges").withIndex("by_active").take(50);
  },
});

/** Badges the current student has earned (joined with badge details). */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const awarded = await ctx.db
      .query("studentBadges")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(50);
    const withDetails = await Promise.all(
      awarded.map(async (a) => {
        const badge = await ctx.db.get(a.badgeId);
        return badge ? { ...badge, awardedAt: a.awardedAt } : null;
      }),
    );
    return withDetails.filter((b): b is NonNullable<typeof b> => b !== null);
  },
});

type Awarded = { key: string; title: string; icon: string; pointsBonus: number };

/**
 * Evaluate all badge criteria for a user and award any newly-earned ones,
 * including bonus points. Returns the list of newly-awarded badges so the
 * client can toast. Internal — called after attempts/lesson completion.
 */
export const checkAndAward = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Awarded[]> => {
    const userId: Id<"users"> = args.userId;

    const [progress, attempts, points] = await Promise.all([
      ctx.db.query("videoProgress").withIndex("by_user", (q) => q.eq("userId", userId)).take(500),
      ctx.db.query("quizAttempts").withIndex("by_user", (q) => q.eq("userId", userId)).take(500),
      ctx.db.query("pointsLedger").withIndex("by_user", (q) => q.eq("userId", userId)).take(1000),
    ]);

    // Completed lessons → subject slugs (for Science count).
    const completedLessonIds = progress.filter((p) => p.completed).map((p) => p.lessonId);
    let scienceCount = 0;
    for (const lid of completedLessonIds) {
      const lesson = await ctx.db.get(lid);
      if (!lesson) continue;
      const subject = await ctx.db.get(lesson.subjectId);
      if (subject?.slug === "science") scienceCount += 1;
    }
    const totalPoints = points.reduce((s, p) => s + p.points, 0);

    // Already-awarded badge keys.
    const awardedRows = await ctx.db
      .query("studentBadges")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(100);
    const awardedBadgeIds = new Set(awardedRows.map((a) => a.badgeId));
    const allBadges = await ctx.db.query("badges").withIndex("by_active").take(50);

    const checks: Record<string, boolean> = {
      first_lesson: completedLessonIds.length >= 1,
      quiz_5: attempts.length >= 5,
      perfect_score: attempts.some((a) => a.percentage === 100),
      science_3: scienceCount >= 3,
      points_500: totalPoints >= 500,
      friday_first: attempts.some((a) => a.fridayQuizId !== undefined),
    };

    const newlyAwarded: Awarded[] = [];
    const now = Date.now();
    for (const badge of allBadges) {
      if (!badge.key || awardedBadgeIds.has(badge._id)) continue;
      if (!checks[badge.key]) continue;
      await ctx.db.insert("studentBadges", {
        userId,
        badgeId: badge._id,
        awardedAt: now,
      });
      if (badge.pointsBonus > 0) {
        await ctx.db.insert("pointsLedger", {
          userId,
          sourceType: "badge",
          sourceId: badge._id,
          points: badge.pointsBonus,
          description: `Badge earned: ${badge.title}`,
          createdAt: now,
        });
      }
      newlyAwarded.push({
        key: badge.key,
        title: badge.title,
        icon: badge.icon,
        pointsBonus: badge.pointsBonus,
      });
    }
    return newlyAwarded;
  },
});
