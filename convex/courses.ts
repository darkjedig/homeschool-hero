import { mutation } from "./_generated/server";
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

/**
 * Create a full course in one transactional mutation:
 * subject + topics + lessons (with quizzes + quiz questions).
 * Parent-only.
 */
export const create = mutation({
  args: {
    subject: v.object({
      name: v.string(),
      slug: v.string(),
      description: v.string(),
      icon: v.string(),
      color: v.string(),
    }),
    topics: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        difficultyLevel: DIFF,
      }),
    ),
    lessons: v.array(
      v.object({
        topicIndex: v.number(),
        title: v.string(),
        description: v.string(),
        videoUrl: v.string(),
        lessonNotes: v.string(),
        difficultyLevel: DIFF,
        estimatedMinutes: v.number(),
        pointsAwarded: v.number(),
        status: v.union(v.literal("draft"), v.literal("published")),
        quizQuestions: v.array(quizQuestion),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const now = Date.now();

    // Upsert subject by slug.
    const existing = await ctx.db
      .query("subjects")
      .withIndex("by_slug", (q) => q.eq("slug", args.subject.slug))
      .unique();
    let subjectId: Id<"subjects">;
    if (existing) {
      subjectId = existing._id;
    } else {
      subjectId = await ctx.db.insert("subjects", {
        name: args.subject.name,
        slug: args.subject.slug,
        description: args.subject.description,
        icon: args.subject.icon,
        color: args.subject.color,
        order: now,
        active: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Create topics; record their generated ids by index.
    const topicIds: Id<"topics">[] = [];
    for (let i = 0; i < args.topics.length; i++) {
      const t = args.topics[i];
      const id = await ctx.db.insert("topics", {
        subjectId,
        name: t.name,
        description: t.description,
        order: i,
        difficultyLevel: t.difficultyLevel,
      });
      topicIds.push(id);
    }

    let lessonsCreated = 0;
    let questionsCreated = 0;
    for (const lesson of args.lessons) {
      const topicId: Id<"topics"> | undefined =
        topicIds[lesson.topicIndex] ?? topicIds[0];
      if (!topicId) continue;
      const lessonId = await ctx.db.insert("lessons", {
        subjectId,
        topicId,
        title: lesson.title,
        slug: `${args.subject.slug}-${lessonsCreated + 1}`,
        description: lesson.description,
        lessonNotes: lesson.lessonNotes,
        videoUrl: lesson.videoUrl,
        videoProvider: "youtube",
        difficultyLevel: lesson.difficultyLevel,
        estimatedMinutes: lesson.estimatedMinutes,
        pointsAwarded: lesson.pointsAwarded,
        status: lesson.status,
        createdBy: parent,
        createdAt: now,
        updatedAt: now,
      });
      lessonsCreated += 1;

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
          questionsCreated += 1;
        }
      }
    }

    return {
      subjectId,
      topicsCreated: topicIds.length,
      lessonsCreated,
      questionsCreated,
    };
  },
});
