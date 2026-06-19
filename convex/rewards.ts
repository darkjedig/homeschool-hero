import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { requireParent } from "./authHelpers";

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

/** All rewards for the parent manager (incl. inactive). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rewards").withIndex("by_active").take(100);
  },
});

/** Create a reward. Parent-only. */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    pointsCost: v.number(),
    rewardType: v.string(),
  },
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const now = Date.now();
    return await ctx.db.insert("rewards", {
      title: args.title,
      description: args.description,
      pointsCost: args.pointsCost,
      rewardType: args.rewardType,
      active: true,
      createdBy: parent,
      createdAt: now,
    });
  },
});

/** Update a reward. Parent-only. */
export const update = mutation({
  args: {
    rewardId: v.id("rewards"),
    title: v.string(),
    description: v.string(),
    pointsCost: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    await ctx.db.patch(args.rewardId, {
      title: args.title,
      description: args.description,
      pointsCost: args.pointsCost,
      active: args.active,
    });
  },
});

/** List redemption requests. Parent-only. */
export const listRedemptions = query({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    return await ctx.db.query("rewardRedemptions").withIndex("by_status").take(100);
  },
});

/** Approve a redemption request. Parent-only. */
export const approveRedemption = mutation({
  args: { redemptionId: v.id("rewardRedemptions") },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    await ctx.db.patch(args.redemptionId, {
      status: "approved",
      updatedAt: Date.now(),
    });
  },
});
