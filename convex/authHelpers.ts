import type { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

export type Role = "parent" | "student";

/** Return the auth user id for the current request, or null. */
export async function getAuthUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx);
}

/** Return the application profile (role + display name) or null. */
export async function getProfile(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"userProfiles"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

/**
 * Resolve the current user id, ensuring a profile exists with the given role.
 * Throws if not authenticated.
 */
export async function requireUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }
  return userId;
}

/** Require an authenticated user with a specific role. */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  role: Role,
): Promise<Id<"users">> {
  const profile = await getProfile(ctx);
  if (profile === null) {
    throw new Error("Not authenticated");
  }
  if (profile.role !== role) {
    throw new Error(`Requires ${role} role`);
  }
  return profile.userId;
}

/** Require the parent role. */
export const requireParent = (ctx: QueryCtx | MutationCtx) =>
  requireRole(ctx, "parent");

/** Require the student role. */
export const requireStudent = (ctx: QueryCtx | MutationCtx) =>
  requireRole(ctx, "student");
