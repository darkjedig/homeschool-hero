import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { householdStudentUserId, requireParent } from "./authHelpers";
import type { Id } from "./_generated/dataModel";

const videoProgressDoc = v.object({
  _id: v.id("videoProgress"),
  _creationTime: v.number(),
  userId: v.id("users"),
  lessonId: v.id("lessons"),
  videoUrl: v.string(),
  secondsWatched: v.number(),
  lastTimestamp: v.number(),
  percentageWatched: v.number(),
  durationSeconds: v.optional(v.number()),
  completed: v.boolean(),
  updatedAt: v.number(),
});

/** Video progress for the current user + lesson (null if none / not authed). */
export const getForLesson = query({
  args: { lessonId: v.id("lessons") },
  returns: v.union(videoProgressDoc, v.null()),
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
    durationSeconds: v.optional(v.number()),
    completed: v.boolean(),
  },
  returns: v.id("videoProgress"),
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
    const farthestSeconds = Math.max(
      existing?.secondsWatched ?? 0,
      args.secondsWatched,
    );
    const farthestPct = Math.max(
      existing?.percentageWatched ?? 0,
      args.percentageWatched,
    );
    const durationSeconds =
      args.durationSeconds && args.durationSeconds > 0
        ? Math.round(args.durationSeconds)
        : existing?.durationSeconds;
    const wasCompleted = existing?.completed ?? false;
    const completed = wasCompleted || args.completed || farthestPct >= 90;
    const durationPatch =
      durationSeconds !== undefined ? { durationSeconds } : {};
    let progressId: Id<"videoProgress">;
    if (existing) {
      await ctx.db.patch(existing._id, {
        videoUrl: args.videoUrl,
        secondsWatched: farthestSeconds,
        lastTimestamp: args.lastTimestamp,
        percentageWatched: farthestPct,
        ...durationPatch,
        completed,
        updatedAt: now,
      });
      progressId = existing._id;
    } else {
      progressId = await ctx.db.insert("videoProgress", {
        userId,
        lessonId: args.lessonId,
        videoUrl: args.videoUrl,
        secondsWatched: farthestSeconds,
        lastTimestamp: args.lastTimestamp,
        percentageWatched: farthestPct,
        ...durationPatch,
        completed,
        updatedAt: now,
      });
    }
    if (completed && !wasCompleted) {
      await ctx.runMutation(internal.badges.checkAndAward, { userId });
    }
    return progressId;
  },
});

/** Watch log for a lesson (parent dashboard / lesson editor). */
export const forLesson = query({
  args: { lessonId: v.id("lessons") },
  returns: v.union(videoProgressDoc, v.null()),
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const studentId = await householdStudentUserId(ctx);
    if (studentId) {
      const row = await ctx.db
        .query("videoProgress")
        .withIndex("by_user_and_lesson", (q) =>
          q.eq("userId", studentId).eq("lessonId", args.lessonId),
        )
        .unique();
      if (row) return row;
    }
    return await ctx.db
      .query("videoProgress")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .first();
  },
});
