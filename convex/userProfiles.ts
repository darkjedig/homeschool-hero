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

/**
 * Dev-only role switch. Lets a signed-in user act as parent/student so the
 * parent dashboard can be exercised before real invitation flows exist.
 * Replaced by proper role assignment in Phase 9.
 */
export const setMyRole = mutation({
  args: { role: v.union(v.literal("parent"), v.literal("student")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("userProfiles", {
      userId,
      role: args.role,
      displayName: args.role === "parent" ? "Parent" : "Student",
      createdAt: now,
      updatedAt: now,
    });
  },
});
