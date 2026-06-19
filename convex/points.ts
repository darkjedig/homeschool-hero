import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Current points balance for the logged-in student (null if not authed). */
export const balance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const entries = await ctx.db
      .query("pointsLedger")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500);
    return entries.reduce((sum, e) => sum + e.points, 0);
  },
});
