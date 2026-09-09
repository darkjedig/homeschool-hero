import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Current user's profile (role + display name), or null if not authed. */
export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

/**
 * Ensure the signed-in user has a profile. Defaults to "student".
 * Called after sign-in. (Role assignment is tightened in Phase 9.)
 */
export const ensureMine = mutation({
  args: { displayName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) return existing._id;
    const now = Date.now();
    return await ctx.db.insert("userProfiles", {
      userId,
      role: "student",
      displayName: args.displayName ?? "Student",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Profile editing never accepts roles or identities from the browser. */
export const updateMine = mutation({
  args: { displayName: v.string(), reducedMotion: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", q => q.eq("userId", userId)).unique();
    if (!profile) throw new Error("Profile not found");
    const displayName = args.displayName.trim();
    if (!displayName || displayName.length > 40) throw new Error("Use a name between 1 and 40 characters.");
    await ctx.db.patch(profile._id, { displayName, reducedMotion: args.reducedMotion, updatedAt: Date.now() });
  },
});

export const hasParentAccess = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const account = await ctx.db.query("familyAccounts").withIndex("by_role", q => q.eq("role", "parent")).unique();
    return account?.userId === userId;
  },
});
