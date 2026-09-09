import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireParent } from "./authHelpers";
import {
  hydrateLesson,
  insertLessonWithBody,
  projectLessonCard,
  syncCalendarLessonMeta,
  upsertLessonBody,
} from "./lib/lessonBodies";

/** Published lessons for a topic (student-facing). Metadata only. */
export const listPublishedByTopic = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_topic_and_status", (q) =>
        q.eq("topicId", args.topicId).eq("status", "published"),
      )
      .take(100);
    return lessons.map(projectLessonCard);
  },
});

/** Published lessons for a subject (across all its topics). Metadata only. */
export const listPublishedBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_subject_and_status", (q) =>
        q.eq("subjectId", args.subjectId).eq("status", "published"),
      )
      .take(100);
    return lessons.map(projectLessonCard);
  },
});

/** A single lesson by id (hydrates body). */
export const get = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) return null;
    if (lesson.status !== "published") await requireParent(ctx);
    return await hydrateLesson(ctx, lesson);
  },
});

/** A single lesson by slug (within a subject). */
export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.query("lessons").withIndex("by_slug", q => q.eq("slug", args.slug)).unique();
    if (!lesson) return null;
    if (lesson.status !== "published") await requireParent(ctx);
    return await hydrateLesson(ctx, lesson);
  },
});

const DIFF = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced"),
);

const quizQuestion = v.object({
  questionText: v.string(),
  questionType: v.union(v.literal("mcq"), v.literal("truefalse"), v.literal("ordering")),
  options: v.array(v.string()),
  correctAnswer: v.string(),
  explanation: v.string(),
});

/** All lessons for the parent manager (incl. drafts). Metadata only. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    const published = await ctx.db
      .query("lessons")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(400);
    const drafts = await ctx.db
      .query("lessons")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .take(100);
    return [...published, ...drafts].map(projectLessonCard);
  },
});

/** Create a single lesson (+ quiz + questions) under an existing topic. Parent-only. */
export const createSingle = mutation({
  args: {
    subjectId: v.id("subjects"),
    topicId: v.id("topics"),
    title: v.string(),
    description: v.string(),
    videoUrl: v.string(),
    lessonNotes: v.string(),
    difficultyLevel: DIFF,
    estimatedMinutes: v.number(),
    pointsAwarded: v.number(),
    status: v.union(v.literal("draft"), v.literal("published")),
    quizQuestions: v.array(quizQuestion),
  },
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const now = Date.now();
    const slug = `${args.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${now.toString(36)}`;
    const lessonId = await insertLessonWithBody(
      ctx,
      {
        subjectId: args.subjectId,
        topicId: args.topicId,
        title: args.title,
        slug,
        description: args.description,
        videoUrl: args.videoUrl,
        videoProvider: "youtube",
        difficultyLevel: args.difficultyLevel,
        estimatedMinutes: args.estimatedMinutes,
        pointsAwarded: args.pointsAwarded,
        status: args.status,
        createdBy: parent,
        createdAt: now,
        updatedAt: now,
      },
      { lessonNotes: args.lessonNotes },
    );

    if (args.quizQuestions.length > 0) {
      const quizId = await ctx.db.insert("quizzes", {
        lessonId,
        subjectId: args.subjectId,
        topicId: args.topicId,
        title: `${args.title} — Quiz`,
        type: "lesson",
        difficultyLevel: args.difficultyLevel,
        pointsAwarded: args.pointsAwarded,
        questionCount: args.quizQuestions.length,
      });
      for (let qi = 0; qi < args.quizQuestions.length; qi++) {
        const q = args.quizQuestions[qi];
        await ctx.db.insert("quizQuestions", {
          quizId,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficultyLevel: args.difficultyLevel,
          order: qi,
        });
      }
    }
    return lessonId;
  },
});

/** Toggle a lesson between draft and published. Parent-only. */
export const setStatus = mutation({
  args: {
    lessonId: v.id("lessons"),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    await ctx.db.patch(args.lessonId, { status: args.status, updatedAt: Date.now() });
  },
});

/** Edit a lesson's fields (parent-only). */
export const update = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.string(),
    description: v.string(),
    lessonNotes: v.string(),
    videoUrl: v.string(),
    difficultyLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    estimatedMinutes: v.number(),
    pointsAwarded: v.number(),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const existing = await ctx.db.get(args.lessonId);
    if (!existing) throw new Error("Lesson not found");
    await ctx.db.patch(args.lessonId, {
      title: args.title,
      description: args.description,
      videoUrl: args.videoUrl,
      difficultyLevel: args.difficultyLevel,
      estimatedMinutes: args.estimatedMinutes,
      pointsAwarded: args.pointsAwarded,
      status: args.status,
      updatedAt: Date.now(),
    });
    const hydrated = await hydrateLesson(ctx, existing);
    await upsertLessonBody(ctx, args.lessonId, {
      content: hydrated.content,
      lessonNotes: args.lessonNotes,
    });
    await syncCalendarLessonMeta(ctx, args.lessonId, args.title, args.pointsAwarded);
  },
});

/** All lessons joined with their subject (parent manager grouping view). */
export const listAllWithSubject = query({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    const lessons = await ctx.db.query("lessons").withIndex("by_status").take(400);
    const subjectIds = [...new Set(lessons.map((l) => l.subjectId))];
    const [subjectResults, topics] = await Promise.all([
      Promise.all(subjectIds.map((id) => ctx.db.get(id))),
      ctx.db.query("topics").take(500),
    ]);
    const subjectById = new Map(subjectResults.map((s) => (s ? [s._id, s] : [null, null])));
    const topicById = new Map(topics.map((t) => [t._id, t]));
    return lessons
      .map((l) => {
        const subject = subjectById.get(l.subjectId);
        const topic = topicById.get(l.topicId);
        return {
          _id: l._id,
          title: l.title,
          status: l.status,
          difficultyLevel: l.difficultyLevel,
          pointsAwarded: l.pointsAwarded,
          videoUrl: l.videoUrl,
          subjectId: l.subjectId,
          subjectName: subject?.name ?? "Unknown",
          subjectSlug: subject?.slug ?? "",
          subjectColor: subject?.color ?? "#3b82f6",
          topicId: l.topicId,
          topicName: topic?.name ?? "Uncategorised",
          topicOrder: topic?.order ?? Number.MAX_SAFE_INTEGER,
          createdAt: l._creationTime,
        };
      })
      .sort((a, b) => {
        if (a.subjectName !== b.subjectName) {
          return a.subjectName.localeCompare(b.subjectName);
        }
        if (a.topicOrder !== b.topicOrder) return a.topicOrder - b.topicOrder;
        return a.createdAt - b.createdAt;
      });
  },
});

/** Paginated student library: drafts never enter search results. */
export const library = query({
  args: { paginationOpts: paginationOptsValidator, subjectId: v.optional(v.id("subjects")), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const term = args.search?.trim();
    const source = term
      ? ctx.db.query("lessons").withSearchIndex("published_title", q => {
          const search = q.search("title", term).eq("status", "published");
          return args.subjectId ? search.eq("subjectId", args.subjectId) : search;
        })
      : args.subjectId
        ? ctx.db.query("lessons").withIndex("by_subject_and_status", q => q.eq("subjectId", args.subjectId!).eq("status", "published"))
        : ctx.db.query("lessons").withIndex("by_status", q => q.eq("status", "published"));
    const result = await source.paginate(args.paginationOpts);
    const subjects = await Promise.all([...new Set(result.page.map(l => l.subjectId))].map(id => ctx.db.get(id)));
    const bySubject = new Map(subjects.flatMap(s => s ? [[s._id, s] as const] : []));
    const page = await Promise.all(result.page.map(async lesson => {
      const subject = bySubject.get(lesson.subjectId);
      const progress = userId ? await ctx.db.query("videoProgress").withIndex("by_user_and_lesson", q => q.eq("userId", userId).eq("lessonId", lesson._id)).unique() : null;
      return { _id: lesson._id, title: lesson.title, description: lesson.description, subjectName: subject?.name ?? "Subject", subjectSlug: subject?.slug ?? "", subjectColor: subject?.color ?? "#38bdf8", subjectIcon: subject?.icon, estimatedMinutes: lesson.estimatedMinutes, pointsAwarded: lesson.pointsAwarded, difficultyLevel: lesson.difficultyLevel, kind: lesson.kind ?? "lesson", progress: progress?.percentageWatched ?? 0, completed: progress?.completed ?? false };
    }));
    return { ...result, page };
  },
});
