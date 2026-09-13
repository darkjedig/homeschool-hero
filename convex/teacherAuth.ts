import { internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getProfile, requireParent } from "./authHelpers";

export const getActor = internalQuery({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      role: v.union(v.literal("parent"), v.literal("student")),
      displayName: v.string(),
      reducedMotion: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const profile = await getProfile(ctx);
    if (!profile) return null;
    return {
      role: profile.role,
      displayName: profile.displayName,
      reducedMotion: profile.reducedMotion ?? false,
    };
  },
});

export const assertParent = internalQuery({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requireParent(ctx);
    return null;
  },
});
