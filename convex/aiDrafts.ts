import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireParent } from "./authHelpers";
import type { Id } from "./_generated/dataModel";

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

// -------------------- course drafts --------------------

/** Create a "generating" course draft; returns its id (parent-only). */
export const createCourseDraft = mutation({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const now = Date.now();
    return await ctx.db.insert("aiCourseDrafts", {
      requestedBy: parent,
      prompt: args.prompt,
      status: "generating",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** List this parent's course drafts, newest first (parent-only). */
export const listCourseDrafts = query({
  args: {},
  handler: async (ctx) => {
    const parent = await requireParent(ctx);
    return await ctx.db
      .query("aiCourseDrafts")
      .withIndex("by_requester", (q) => q.eq("requestedBy", parent))
      .order("desc")
      .take(25);
  },
});

export const getCourseDraft = query({
  args: { draftId: v.id("aiCourseDrafts") },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    return await ctx.db.get(args.draftId);
  },
});

/** Internal: write the generated course content (or failure) onto the draft. */
export const saveCourseResult = internalMutation({
  args: {
    draftId: v.id("aiCourseDrafts"),
    model: v.string(),
    ok: v.boolean(),
    errorMessage: v.optional(v.string()),
    subject: v.optional(
      v.object({
        name: v.string(),
        description: v.string(),
        icon: v.string(),
        color: v.string(),
      }),
    ),
    topics: v.optional(
      v.array(
        v.object({ name: v.string(), description: v.string(), difficultyLevel: DIFF }),
      ),
    ),
    lessons: v.optional(
      v.array(
        v.object({
          topicIndex: v.number(),
          title: v.string(),
          notes: v.string(),
          videoUrl: v.string(),
          difficultyLevel: DIFF,
          pointsAwarded: v.number(),
          quizQuestions: v.array(quizQuestion),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    if (!args.ok) {
      await ctx.db.patch(args.draftId, {
        status: "failed",
        model: args.model,
        errorMessage: args.errorMessage ?? "Generation failed",
        updatedAt: now,
      });
      return;
    }
    await ctx.db.patch(args.draftId, {
      status: "pending",
      model: args.model,
      proposedSubject: args.subject,
      proposedTopics: args.topics,
      proposedLessons: args.lessons,
      updatedAt: now,
    });
  },
});

/** Approve a course draft: transactionally publish subject+topics+lessons+
 * quizzes+questions, then mark approved (parent-only). */
export const approveCourseDraft = mutation({
  args: {
    draftId: v.id("aiCourseDrafts"),
    // Editable fields the parent may have tweaked in the review UI.
    subject: v.object({
      name: v.string(),
      description: v.string(),
      icon: v.string(),
      color: v.string(),
    }),
    topics: v.array(
      v.object({ name: v.string(), description: v.string(), difficultyLevel: DIFF }),
    ),
    lessons: v.array(
      v.object({
        topicIndex: v.number(),
        title: v.string(),
        notes: v.string(),
        videoUrl: v.string(),
        difficultyLevel: DIFF,
        pointsAwarded: v.number(),
        quizQuestions: v.array(quizQuestion),
      }),
    ),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const draft = await ctx.db.get(args.draftId);
    if (!draft) throw new Error("Draft not found");

    const now = Date.now();
    const existing = await ctx.db
      .query("subjects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    let subjectId: Id<"subjects">;
    if (existing) {
      subjectId = existing._id;
    } else {
      subjectId = await ctx.db.insert("subjects", {
        name: args.subject.name,
        slug: args.slug,
        description: args.subject.description,
        icon: args.subject.icon,
        color: args.subject.color,
        order: now,
        active: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    const topicIds: Id<"topics">[] = [];
    for (let i = 0; i < args.topics.length; i++) {
      const t = args.topics[i];
      topicIds.push(
        await ctx.db.insert("topics", {
          subjectId,
          name: t.name,
          description: t.description,
          order: i,
          difficultyLevel: t.difficultyLevel,
        }),
      );
    }

    for (const lesson of args.lessons) {
      const topicId = topicIds[lesson.topicIndex] ?? topicIds[0];
      if (!topicId) continue;
      const lessonId = await ctx.db.insert("lessons", {
        subjectId,
        topicId,
        title: lesson.title,
        slug: `${args.slug}-${topicIds.indexOf(topicId)}-${now.toString(36)}`.toLowerCase(),
        description: lesson.notes.slice(0, 140),
        lessonNotes: lesson.notes,
        videoUrl: lesson.videoUrl,
        videoProvider: "youtube",
        difficultyLevel: lesson.difficultyLevel,
        estimatedMinutes: 10,
        pointsAwarded: lesson.pointsAwarded,
        status: "published",
        createdBy: parent,
        createdAt: now,
        updatedAt: now,
      });
      if (lesson.quizQuestions.length > 0) {
        const quizId = await ctx.db.insert("quizzes", {
          lessonId,
          subjectId,
          topicId,
          title: `${lesson.title} — Quiz`,
          type: "lesson",
          difficultyLevel: lesson.difficultyLevel,
          pointsAwarded: lesson.pointsAwarded,
        });
        for (let qi = 0; qi < lesson.quizQuestions.length; qi++) {
          const q = lesson.quizQuestions[qi];
          await ctx.db.insert("quizQuestions", {
            quizId,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficultyLevel: lesson.difficultyLevel,
            order: qi,
          });
        }
      }
    }

    await ctx.db.patch(args.draftId, { status: "approved", updatedAt: now });
    return { subjectId, lessonsCreated: args.lessons.length };
  },
});

/** Reject / dismiss a draft (parent-only). */
export const rejectDraft = mutation({
  args: {
    draftId: v.id("aiCourseDrafts"),
    kind: v.union(v.literal("course"), v.literal("lesson")),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const table = args.kind === "course" ? "aiCourseDrafts" : "aiLessonDrafts";
    await ctx.db.patch(args.draftId as never, { status: "rejected", updatedAt: Date.now() });
    void table;
  },
});

// -------------------- lesson drafts --------------------

export const createLessonDraft = mutation({
  args: {
    prompt: v.string(),
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
    difficultyLevel: DIFF,
  },
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const now = Date.now();
    return await ctx.db.insert("aiLessonDrafts", {
      requestedBy: parent,
      prompt: args.prompt,
      subjectId: args.subjectId,
      topicId: args.topicId,
      difficultyLevel: args.difficultyLevel,
      status: "generating",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listLessonDrafts = query({
  args: {},
  handler: async (ctx) => {
    const parent = await requireParent(ctx);
    return await ctx.db
      .query("aiLessonDrafts")
      .withIndex("by_requester", (q) => q.eq("requestedBy", parent))
      .order("desc")
      .take(25);
  },
});

export const getLessonDraft = query({
  args: { draftId: v.id("aiLessonDrafts") },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    return await ctx.db.get(args.draftId);
  },
});

/** Internal: write the generated lesson content (or failure) onto the draft. */
export const saveLessonResult = internalMutation({
  args: {
    draftId: v.id("aiLessonDrafts"),
    model: v.string(),
    ok: v.boolean(),
    errorMessage: v.optional(v.string()),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    quizQuestions: v.optional(v.array(quizQuestion)),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    if (!args.ok) {
      await ctx.db.patch(args.draftId, {
        status: "failed",
        model: args.model,
        errorMessage: args.errorMessage ?? "Generation failed",
        updatedAt: now,
      });
      return;
    }
    await ctx.db.patch(args.draftId, {
      status: "pending",
      model: args.model,
      proposedTitle: args.title,
      proposedNotes: args.notes,
      proposedVideoUrl: args.videoUrl,
      proposedQuizQuestions: args.quizQuestions,
      updatedAt: now,
    });
  },
});

/** Approve a lesson draft: publish a single lesson + quiz + questions (parent-only). */
export const approveLessonDraft = mutation({
  args: {
    draftId: v.id("aiLessonDrafts"),
    subjectId: v.id("subjects"),
    topicId: v.id("topics"),
    title: v.string(),
    notes: v.string(),
    videoUrl: v.string(),
    difficultyLevel: DIFF,
    pointsAwarded: v.number(),
    quizQuestions: v.array(quizQuestion),
  },
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const now = Date.now();
    const slug = `${args.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${now.toString(36)}`;
    const lessonId = await ctx.db.insert("lessons", {
      subjectId: args.subjectId,
      topicId: args.topicId,
      title: args.title,
      slug,
      description: args.notes.slice(0, 140),
      lessonNotes: args.notes,
      videoUrl: args.videoUrl,
      videoProvider: "youtube",
      difficultyLevel: args.difficultyLevel,
      estimatedMinutes: 10,
      pointsAwarded: args.pointsAwarded,
      status: "published",
      createdBy: parent,
      createdAt: now,
      updatedAt: now,
    });
    if (args.quizQuestions.length > 0) {
      const quizId = await ctx.db.insert("quizzes", {
        lessonId,
        subjectId: args.subjectId,
        topicId: args.topicId,
        title: `${args.title} — Quiz`,
        type: "lesson",
        difficultyLevel: args.difficultyLevel,
        pointsAwarded: args.pointsAwarded,
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
    await ctx.db.patch(args.draftId, { status: "approved", updatedAt: now });
    return lessonId;
  },
});
