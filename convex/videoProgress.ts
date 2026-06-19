import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Video progress for the current user + lesson (null if none / not authed). */
export const getForLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("videoProgress")
      .withIndex("by_user_and_lesson", (q) =>
        q.eq("userId", userId).eq("lessonId", args.lessonId),
      )
      .unique();
  },
});

/** Create or update watch progress for a lesson. Auth required. */
export const upsert = mutation({
  args: {
    lessonId: v.id("lessons"),
    videoUrl: v.string(),
    secondsWatched: v.number(),
    lastTimestamp: v.number(),
    percentageWatched: v.number(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("videoProgress")
      .withIndex("by_user_and_lesson", (q) =>
        q.eq("userId", userId).eq("lessonId", args.lessonId),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        secondsWatched: args.secondsWatched,
        lastTimestamp: args.lastTimestamp,
        percentageWatched: args.percentageWatched,
        completed: existing.completed || args.completed,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("videoProgress", {
      userId,
      lessonId: args.lessonId,
      videoUrl: args.videoUrl,
      secondsWatched: args.secondsWatched,
      lastTimestamp: args.lastTimestamp,
      percentageWatched: args.percentageWatched,
      completed: args.completed,
      updatedAt: now,
    });
  },
});
