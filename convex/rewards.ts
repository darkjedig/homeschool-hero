import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

/** Active rewards, cheapest first (student reward shop). */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("rewards")
      .withIndex("by_cost")
      .filter((q) => q.eq(q.field("active"), true))
      .take(50);
  },
});

/** Redeem a reward if the student has enough points. Auth required. */
export const redeem = mutation({
  args: { rewardId: v.id("rewards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const reward = await ctx.db.get(args.rewardId);
    if (!reward || !reward.active) throw new Error("Reward unavailable");

    const balance = await currentPoints(ctx, userId);
    if (balance < reward.pointsCost) {
      throw new Error("Not enough points");
    }

    const now = Date.now();
    const redemptionId = await ctx.db.insert("rewardRedemptions", {
      userId,
      rewardId: args.rewardId,
      pointsSpent: reward.pointsCost,
      status: "requested",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("pointsLedger", {
      userId,
      sourceType: "reward",
      sourceId: redemptionId,
      points: -reward.pointsCost,
      description: `Redeemed: ${reward.title}`,
      createdAt: now,
    });
    return redemptionId;
  },
});

async function currentPoints(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<number> {
  const entries = await ctx.db
    .query("pointsLedger")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .take(500);
  return entries.reduce((sum, e) => sum + e.points, 0);
}
