import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireParent } from "./authHelpers";

/** All active subjects, ordered by `order`. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subjects")
      .withIndex("by_active_order", (q) => q.eq("active", true))
      .collect();
  },
});

/** A single subject by slug. */
export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subjects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/** All subjects regardless of active state (parent manager). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    return await ctx.db.query("subjects").withIndex("by_active_order").take(100);
  },
});

/** Count of topics under each subject (parent manager overview). */
export const topicCounts = query({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    const subjects = await ctx.db.query("subjects").take(100);
    const counts: Record<string, number> = {};
    for (const s of subjects) {
      const topics = await ctx.db
        .query("topics")
        .withIndex("by_subject", (q) => q.eq("subjectId", s._id))
        .take(200);
      counts[s._id] = topics.length;
    }
    return counts;
  },
});

/** Create a subject (parent-only). */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const now = Date.now();
    return await ctx.db.insert("subjects", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      icon: args.icon,
      color: args.color,
      order: now,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update a subject's editable fields (parent-only). */
export const update = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    await ctx.db.patch(args.subjectId, {
      name: args.name,
      slug: args.slug,
      description: args.description,
      icon: args.icon,
      color: args.color,
      active: args.active,
      updatedAt: Date.now(),
    });
  },
});

/** Delete a subject and cascade-delete its topics, lessons, quizzes, questions (parent-only). */
export const remove = mutation({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const topics = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .take(200);
    for (const t of topics) {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_topic", (q) => q.eq("topicId", t._id))
        .take(200);
      for (const l of lessons) {
        const quizzes = await ctx.db
          .query("quizzes")
          .withIndex("by_lesson", (q) => q.eq("lessonId", l._id))
          .take(50);
        for (const q of quizzes) {
          const questions = await ctx.db
            .query("quizQuestions")
            .withIndex("by_quiz_and_order", (qq) => qq.eq("quizId", q._id))
            .take(100);
          for (const qqd of questions) await ctx.db.delete(qqd._id);
          await ctx.db.delete(q._id);
        }
        await ctx.db.delete(l._id);
      }
      await ctx.db.delete(t._id);
    }
    await ctx.db.delete(args.subjectId);
  },
});

