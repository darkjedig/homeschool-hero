import { mutation, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  hydrateLesson,
  stripLessonFatFields,
  upsertLessonBody,
} from "./lib/lessonBodies";

const LESSON_BATCH = 5;
const QUIZ_BATCH = 25;
const CAL_BATCH = 40;

/**
 * One-shot: copy fat lesson fields into `lessonBodies`, strip them from
 * `lessons`, backfill quiz.questionCount, denormalize calendar titles.
 * Idempotent. Chains batches via the scheduler so we stay under Convex
 * read/write limits.
 *
 *   npx convex run migrateIo:start
 */
export const start = mutation({
  args: {},
  returns: v.object({ started: v.boolean() }),
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, internal.migrateIo.bodiesBatch, {
      cursor: null,
    });
    return { started: true };
  },
});

export const progress = query({
  args: {},
  returns: v.object({
    bodies: v.number(),
    fatLessons: v.number(),
    quizzesMissingCount: v.number(),
    calendarMissingTitle: v.number(),
  }),
  handler: async (ctx) => {
    const [lessons, bodies, quizzes, cal] = await Promise.all([
      ctx.db.query("lessons").take(500),
      ctx.db.query("lessonBodies").take(500),
      ctx.db.query("quizzes").take(400),
      ctx.db.query("calendarEntries").take(800),
    ]);
    return {
      bodies: bodies.length,
      fatLessons: lessons.filter(
        (l) => l.content !== undefined || l.lessonNotes !== undefined,
      ).length,
      quizzesMissingCount: quizzes.filter((q) => q.questionCount === undefined).length,
      calendarMissingTitle: cal.filter(
        (e) => e.lessonId !== undefined && e.lessonTitle === undefined,
      ).length,
    };
  },
});

export const bodiesBatch = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  returns: v.object({
    processed: v.number(),
    stripped: v.number(),
    done: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const page = await ctx.db.query("lessons").paginate({
      numItems: LESSON_BATCH,
      cursor: args.cursor,
    });
    let stripped = 0;
    for (const lesson of page.page) {
      const hydrated = await hydrateLesson(ctx, lesson);
      await upsertLessonBody(ctx, lesson._id, {
        content: hydrated.content,
        lessonNotes: hydrated.lessonNotes,
      });
      const did = await stripLessonFatFields(ctx, lesson);
      if (did) stripped += 1;
    }
    if (page.isDone) {
      await ctx.scheduler.runAfter(0, internal.migrateIo.quizCountsBatch, {
        cursor: null,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.migrateIo.bodiesBatch, {
        cursor: page.continueCursor,
      });
    }
    return { processed: page.page.length, stripped, done: page.isDone };
  },
});

export const quizCountsBatch = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  returns: v.object({ processed: v.number(), done: v.boolean() }),
  handler: async (ctx, args) => {
    const page = await ctx.db.query("quizzes").paginate({
      numItems: QUIZ_BATCH,
      cursor: args.cursor,
    });
    for (const quiz of page.page) {
      if (quiz.questionCount !== undefined) continue;
      const questions = await ctx.db
        .query("quizQuestions")
        .withIndex("by_quiz_and_order", (q) => q.eq("quizId", quiz._id))
        .take(50);
      await ctx.db.patch(quiz._id, { questionCount: questions.length });
    }
    if (page.isDone) {
      await ctx.scheduler.runAfter(0, internal.migrateIo.calendarMetaBatch, {
        cursor: null,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.migrateIo.quizCountsBatch, {
        cursor: page.continueCursor,
      });
    }
    return { processed: page.page.length, done: page.isDone };
  },
});

export const calendarMetaBatch = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  returns: v.object({ processed: v.number(), patched: v.number(), done: v.boolean() }),
  handler: async (ctx, args) => {
    const page = await ctx.db.query("calendarEntries").paginate({
      numItems: CAL_BATCH,
      cursor: args.cursor,
    });
    let patched = 0;
    for (const entry of page.page) {
      if (!entry.lessonId) continue;
      if (entry.lessonTitle !== undefined && entry.pointsAwarded !== undefined) {
        continue;
      }
      const lesson = await ctx.db.get(entry.lessonId);
      await ctx.db.patch(entry._id, {
        lessonTitle: lesson?.title ?? entry.lessonTitle,
        pointsAwarded: lesson?.pointsAwarded ?? entry.pointsAwarded,
      });
      patched += 1;
    }
    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.migrateIo.calendarMetaBatch, {
        cursor: page.continueCursor,
      });
    }
    return { processed: page.page.length, patched, done: page.isDone };
  },
});
