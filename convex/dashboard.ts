import { query } from "./_generated/server";

/**
 * Aggregate stats for the parent dashboard. Uses bounded reads; accurate for
 * MVP volumes. All counts derive from live Convex data.
 */
export const overview = query({
  args: {},
  handler: async (ctx) => {
    const [subjects, lessons, quizzes, attempts, rewards, redemptions, points] =
      await Promise.all([
        ctx.db.query("subjects").withIndex("by_active_order").take(50),
        ctx.db.query("lessons").withIndex("by_status").take(200),
        ctx.db.query("quizzes").withIndex("by_type").take(200),
        ctx.db.query("quizAttempts").withIndex("by_user").take(500),
        ctx.db.query("rewards").withIndex("by_active").take(100),
        ctx.db.query("rewardRedemptions").withIndex("by_status").take(200),
        ctx.db.query("pointsLedger").withIndex("by_user").take(1000),
      ]);

    const published = lessons.filter((l) => l.status === "published").length;
    const drafts = lessons.length - published;
    const totalPoints = points.reduce((s, p) => s + p.points, 0);
    const avgScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length,
          )
        : 0;

    // Per-subject lesson counts + attempts (for weak-subject detection).
    const bySubject = new Map<
      string,
      { lessons: number; attempts: number; totalPct: number }
    >();
    for (const l of lessons) {
      const e = bySubject.get(l.subjectId) ?? {
        lessons: 0,
        attempts: 0,
        totalPct: 0,
      };
      e.lessons += 1;
      bySubject.set(l.subjectId, e);
    }

    return {
      counts: {
        subjects: subjects.length,
        publishedLessons: published,
        draftLessons: drafts,
        quizzes: quizzes.length,
        attempts: attempts.length,
        rewards: rewards.length,
        redemptions: redemptions.length,
      },
      totalPoints,
      avgScore,
      recentAttempts: attempts
        .slice()
        .sort((a, b) => b.completedAt - a.completedAt)
        .slice(0, 8),
    };
  },
});
