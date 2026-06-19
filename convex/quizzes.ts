import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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
  handler: async (ctx, args) => {
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

    return { attemptId, percentage, pointsEarned };
  },
});
