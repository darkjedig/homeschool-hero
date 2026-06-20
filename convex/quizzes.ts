import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { requireParent } from "./authHelpers";
import type { Id } from "./_generated/dataModel";

type AwardedBadge = { key: string; title: string; icon: string; pointsBonus: number };

/** A quiz with its questions by quiz id (student-facing). */
export const getWithQuestions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz_and_order", (q) => q.eq("quizId", quiz._id))
      .take(50);
    return { quiz, questions };
  },
});

/** A quiz with its questions, for a given lesson (student-facing). */
export const getForLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .filter((q) => q.eq(q.field("type"), "lesson"))
      .unique();
    if (!quiz) return null;
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz_and_order", (q) => q.eq("quizId", quiz._id))
      .take(50);
    return { quiz, questions };
  },
});

/** Submit a quiz attempt and record points. Auth required. */
export const submitAttempt = mutation({
  args: {
    quizId: v.id("quizzes"),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        selectedAnswer: v.string(),
        correct: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args): Promise<{
    attemptId: Id<"quizAttempts">;
    percentage: number;
    pointsEarned: number;
    newBadges: AwardedBadge[];
  }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");

    const correct = args.answers.filter((a) => a.correct).length;
    const total = args.answers.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const pointsEarned = Math.round(
      (quiz.pointsAwarded * correct) / Math.max(total, 1),
    );

    const attemptId = await ctx.db.insert("quizAttempts", {
      userId,
      quizId: args.quizId,
      score: correct,
      totalQuestions: total,
      correctAnswers: correct,
      percentage,
      pointsEarned,
      completedAt: Date.now(),
      answers: args.answers,
    });

    if (pointsEarned > 0) {
      await ctx.db.insert("pointsLedger", {
        userId,
        sourceType: "quiz",
        sourceId: args.quizId,
        points: pointsEarned,
        description: `Quiz: ${quiz.title}`,
        createdAt: Date.now(),
      });
    }

    const newBadges = await ctx.runMutation(internal.badges.checkAndAward, {
      userId,
    });
    return { attemptId, percentage, pointsEarned, newBadges };
  },
});

/** All quizzes joined with lesson/subject (parent manager). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    const quizzes = await ctx.db.query("quizzes").take(300);
    const lessonIds = [...new Set(quizzes.map((q) => q.lessonId))];
    const lessons = await Promise.all(lessonIds.map((id) => ctx.db.get(id)));
    const lessonById = new Map(lessons.map((l) => (l ? [l._id, l] : [null, null])));
    const out = [];
    for (const q of quizzes) {
      const lesson = lessonById.get(q.lessonId);
      const subject = lesson ? await ctx.db.get(lesson.subjectId) : null;
      const questions = await ctx.db
        .query("quizQuestions")
        .withIndex("by_quiz_and_order", (qq) => qq.eq("quizId", q._id))
        .take(50);
      const attempts = await ctx.db
        .query("quizAttempts")
        .withIndex("by_quiz", (qa) => qa.eq("quizId", q._id))
        .take(20);
      out.push({
        _id: q._id,
        title: q.title,
        lessonId: q.lessonId,
        lessonTitle: lesson?.title ?? "—",
        subjectName: subject?.name ?? "—",
        subjectColor: subject?.color ?? "#3b82f6",
        questionCount: questions.length,
        createdAt: q._creationTime,
        attemptsCount: attempts.length,
        latestPercentage: attempts.length > 0
          ? attempts.sort((a, b) => b.completedAt - a.completedAt)[0].percentage
          : null,
        bestPercentage: attempts.length > 0
          ? Math.max(...attempts.map((a) => a.percentage))
          : null,
      });
    }
    return out.sort((a, b) =>
      a.subjectName === b.subjectName
        ? a.lessonTitle.localeCompare(b.lessonTitle)
        : a.subjectName.localeCompare(b.subjectName),
    );
  },
});

/** Full quiz with editable questions (parent). */
export const getEditable = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz_and_order", (q) => q.eq("quizId", quiz._id))
      .take(50);
    return { quiz, questions };
  },
});

/** Add a question to a quiz (parent). */
export const addQuestion = mutation({
  args: {
    quizId: v.id("quizzes"),
    questionText: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.string(),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");
    const existing = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz_and_order", (q) => q.eq("quizId", args.quizId))
      .take(50);
    return await ctx.db.insert("quizQuestions", {
      quizId: args.quizId,
      questionText: args.questionText,
      questionType: "mcq",
      options: args.options,
      correctAnswer: args.correctAnswer,
      explanation: args.explanation,
      difficultyLevel: quiz.difficultyLevel,
      order: existing.length,
    });
  },
});

/** Update a question (parent). */
export const updateQuestion = mutation({
  args: {
    questionId: v.id("quizQuestions"),
    questionText: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.string(),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    await ctx.db.patch(args.questionId, {
      questionText: args.questionText,
      options: args.options,
      correctAnswer: args.correctAnswer,
      explanation: args.explanation,
    });
  },
});

/** Delete a question (parent). */
export const deleteQuestion = mutation({
  args: { questionId: v.id("quizQuestions") },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    await ctx.db.delete(args.questionId);
  },
});

/** Ensure a lesson has a quiz; returns the quiz id (parent). Creates one if missing. */
export const ensureForLesson = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const existing = await ctx.db
      .query("quizzes")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .filter((q) => q.eq(q.field("type"), "lesson"))
      .unique();
    if (existing) return existing._id;
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");
    return await ctx.db.insert("quizzes", {
      lessonId: lesson._id,
      subjectId: lesson.subjectId,
      topicId: lesson.topicId,
      title: `${lesson.title} — Quiz`,
      type: "lesson",
      difficultyLevel: lesson.difficultyLevel,
      pointsAwarded: lesson.pointsAwarded,
    });
  },
});
