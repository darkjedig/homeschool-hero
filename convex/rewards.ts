import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { requireParent } from "./authHelpers";

const rewardDoc = v.object({
  _id: v.id("rewards"),
  _creationTime: v.number(),
  title: v.string(),
  description: v.string(),
  pointsCost: v.number(),
  rewardType: v.string(),
  active: v.boolean(),
  createdBy: v.id("users"),
  createdAt: v.number(),
});

function normalizeReward(args: { title: string; description: string; pointsCost: number }) {
  const title = args.title.trim();
  if (!title) throw new Error("Give the reward a name.");
  if (title.length > 80) throw new Error("Keep the title under 80 characters.");
  const description = args.description.trim();
  if (description.length > 400) throw new Error("Keep the description under 400 characters.");
  const pointsCost = Math.round(args.pointsCost);
  if (!Number.isFinite(pointsCost) || pointsCost < 1) {
    throw new Error("Points cost must be at least 1.");
  }
  return { title, description, pointsCost };
}

/** Active rewards, cheapest first (student reward shop). */
export const listActive = query({
  args: {},
  returns: v.array(rewardDoc),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("rewards")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(50);
    return rows.sort((a, b) => a.pointsCost - b.pointsCost);
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
  returns: v.array(rewardDoc),
  handler: async (ctx) => {
    await requireParent(ctx);
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
  returns: v.id("rewards"),
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const fields = normalizeReward(args);
    const now = Date.now();
    return await ctx.db.insert("rewards", {
      ...fields,
      rewardType: args.rewardType.trim() || "custom",
      active: true,
      createdBy: parent,
      createdAt: now,
    });
  },
});

/** Update an existing reward. Parent-only. */
export const update = mutation({
  args: {
    rewardId: v.id("rewards"),
    title: v.string(),
    description: v.string(),
    pointsCost: v.number(),
    active: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const existing = await ctx.db.get(args.rewardId);
    if (!existing) throw new Error("Reward not found");
    const fields = normalizeReward(args);
    await ctx.db.patch(args.rewardId, {
      ...fields,
      active: args.active,
    });
    return null;
  },
});

/** List redemption requests. Parent-only. */
export const listRedemptions = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("rewardRedemptions"),
      _creationTime: v.number(),
      userId: v.id("users"),
      rewardId: v.id("rewards"),
      rewardTitle: v.string(),
      pointsSpent: v.number(),
      status: v.union(
        v.literal("requested"),
        v.literal("approved"),
        v.literal("redeemed"),
      ),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await requireParent(ctx);
    const rows = await ctx.db.query("rewardRedemptions").withIndex("by_status").take(100);
    return await Promise.all(
      rows.map(async (row) => {
        const reward = await ctx.db.get(row.rewardId);
        return { ...row, rewardTitle: reward?.title ?? "Removed reward" };
      }),
    );
  },
});

/** Approve a redemption request. Parent-only. */
export const approveRedemption = mutation({
  args: { redemptionId: v.id("rewardRedemptions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const existing = await ctx.db.get(args.redemptionId);
    if (!existing) throw new Error("Redemption not found");
    await ctx.db.patch(args.redemptionId, {
      status: "approved",
      updatedAt: Date.now(),
    });
    return null;
  },
});
