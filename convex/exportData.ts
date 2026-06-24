import { internalQuery } from "./_generated/server";
import { requireParent } from "./authHelpers";

/** Aggregate all learning data for export (parent-only, internal). */
export const allData = internalQuery({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    const [subjects, lessons, quizzes, attempts, videoProgress, points, redemptions, interactiveResults] =
      await Promise.all([
        ctx.db.query("subjects").take(200),
        ctx.db.query("lessons").take(500),
        ctx.db.query("quizzes").take(500),
        ctx.db.query("quizAttempts").take(1000),
        ctx.db.query("videoProgress").take(1000),
        ctx.db.query("pointsLedger").take(2000),
        ctx.db.query("rewardRedemptions").take(500),
        ctx.db.query("interactiveResults").take(2000),
      ]);
    void quizzes;
    return { subjects, lessons, attempts, videoProgress, points, redemptions, interactiveResults };
  },
});
