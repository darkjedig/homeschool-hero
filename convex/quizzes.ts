import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { householdStudentUserId, requireParent } from "./authHelpers";
import { ensureActivityDay } from "./lib/activityDays";
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

/**
 * Per-subject quiz summary for the student quizzes landing page. Returns each
 * active subject with how many lesson-quizzes it has and the student's taken
 * count + best score, so the page can render informative jump cards.
 */
export const subjectCards = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const [subjects, quizzes, attempts] = await Promise.all([
      ctx.db.query("subjects").withIndex("by_active_order").take(50),
      ctx.db.query("quizzes").withIndex("by_type", (q) => q.eq("type", "lesson")).take(400),
      userId
        ? ctx.db
            .query("quizAttempts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .take(500)
        : Promise.resolve([]),
    ]);

    const quizzesBySubject = new Map<Id<"subjects">, Id<"quizzes">[]>();
    for (const q of quizzes) {
      if (q.type !== "lesson") continue;
      const arr = quizzesBySubject.get(q.subjectId) ?? [];
      arr.push(q._id);
      quizzesBySubject.set(q.subjectId, arr);
    }
    const bestByQuiz = new Map<Id<"quizzes">, number>();
    const takenQuizzes = new Set<Id<"quizzes">>();
    for (const a of attempts) {
      if (!a.quizId) continue;
      takenQuizzes.add(a.quizId);
      const cur = bestByQuiz.get(a.quizId);
      if (cur === undefined || a.percentage > cur) bestByQuiz.set(a.quizId, a.percentage);
    }

    return subjects.map((s) => {
      const quizIds = quizzesBySubject.get(s._id) ?? [];
      let taken = 0;
      let best: number | null = null;
      for (const qid of quizIds) {
        if (takenQuizzes.has(qid)) {
          taken += 1;
          const b = bestByQuiz.get(qid);
          if (b !== undefined && (best === null || b > best)) best = b;
        }
      }
      return {
        _id: s._id,
        name: s.name,
        slug: s.slug,
        color: s.color,
        icon: s.icon,
        total: quizIds.length,
        taken,
        best,
      };
    });
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

    await ensureActivityDay(ctx, userId, Date.now());
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
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_type", (q) => q.eq("type", "lesson"))
      .take(400);
    const lessonIds = [...new Set(quizzes.map((q) => q.lessonId))];
    const lessons = await Promise.all(lessonIds.map((id) => ctx.db.get(id)));
    const lessonById = new Map(
      lessons.flatMap((l) => (l ? [[l._id, l] as const] : [])),
    );
    const subjectIds = [
      ...new Set(
        [...lessonById.values()]
          .map((l) => l.subjectId)
          .concat(quizzes.map((q) => q.subjectId)),
      ),
    ];
    const subjects = await Promise.all(subjectIds.map((id) => ctx.db.get(id)));
    const subjectById = new Map(
      subjects.flatMap((s) => (s ? [[s._id, s] as const] : [])),
    );

    const studentId = await householdStudentUserId(ctx);
    const attempts = studentId
      ? await ctx.db
          .query("quizAttempts")
          .withIndex("by_user", (q) => q.eq("userId", studentId))
          .take(500)
      : [];
    const attemptsByQuiz = new Map<
      Id<"quizzes">,
      { count: number; latest: number; best: number; latestAt: number }
    >();
    for (const a of attempts) {
      if (!a.quizId) continue;
      const cur = attemptsByQuiz.get(a.quizId);
      if (!cur) {
        attemptsByQuiz.set(a.quizId, {
          count: 1,
          latest: a.percentage,
          best: a.percentage,
          latestAt: a.completedAt,
        });
      } else {
        cur.count += 1;
        cur.best = Math.max(cur.best, a.percentage);
        if (a.completedAt >= cur.latestAt) {
          cur.latest = a.percentage;
          cur.latestAt = a.completedAt;
        }
      }
    }

    const out = quizzes.map((q) => {
      const lesson = lessonById.get(q.lessonId);
      const subject = subjectById.get(q.subjectId) ?? (lesson ? subjectById.get(lesson.subjectId) : undefined);
      const stats = attemptsByQuiz.get(q._id);
      return {
        _id: q._id,
        title: q.title,
        lessonId: q.lessonId,
        lessonTitle: lesson?.title ?? "—",
        subjectName: subject?.name ?? "—",
        subjectColor: subject?.color ?? "#3b82f6",
        questionCount: q.questionCount ?? 0,
        createdAt: q._creationTime,
        attemptsCount: stats?.count ?? 0,
        latestPercentage: stats ? stats.latest : null,
        bestPercentage: stats ? stats.best : null,
      };
    });
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

/**
 * Full results for one quiz attempt (parent). Returns the score plus every
 * question with the student's selected answer, the correct answer, and the
 * explanation — works for both lesson quizzes and Friday Challenges.
 */
export const attemptDetail = query({
  args: { attemptId: v.id("quizAttempts") },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) return null;

    let title = "Quiz";
    let subtitle: string | null = null;
    let subjectName: string | null = null;
    let subjectColor: string | null = null;
    let isFriday = false;

    if (attempt.fridayQuizId) {
      isFriday = true;
      const fq = await ctx.db.get(attempt.fridayQuizId);
      title = fq?.title ?? "Friday Challenge";
      subtitle = "Weekly review";
    } else if (attempt.quizId) {
      const quiz = await ctx.db.get(attempt.quizId);
      if (quiz) {
        title = quiz.title;
        const lesson = await ctx.db.get(quiz.lessonId);
        subtitle = lesson?.title ?? null;
        const subj = await ctx.db.get(quiz.subjectId);
        subjectName = subj?.name ?? null;
        subjectColor = subj?.color ?? null;
      }
    }

    const questions = [];
    for (const ans of attempt.answers) {
      const q = await ctx.db.get(ans.questionId);
      questions.push({
        available: q !== null,
        questionText: q?.questionText ?? "This question has been removed.",
        options: q?.options ?? [],
        correctAnswer: q?.correctAnswer ?? "",
        explanation: q?.explanation ?? "",
        selectedAnswer: ans.selectedAnswer,
        correct: ans.correct,
      });
    }

    return {
      attempt: {
        attemptId: attempt._id,
        completedAt: attempt.completedAt,
        percentage: attempt.percentage,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        pointsEarned: attempt.pointsEarned,
      },
      title,
      subtitle,
      subjectName,
      subjectColor,
      isFriday,
      questions,
    };
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
    const questionId = await ctx.db.insert("quizQuestions", {
      quizId: args.quizId,
      questionText: args.questionText,
      questionType: "mcq",
      options: args.options,
      correctAnswer: args.correctAnswer,
      explanation: args.explanation,
      difficultyLevel: quiz.difficultyLevel,
      order: existing.length,
    });
    await ctx.db.patch(args.quizId, { questionCount: existing.length + 1 });
    return questionId;
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
    const question = await ctx.db.get(args.questionId);
    if (!question) return;
    await ctx.db.delete(args.questionId);
    const remaining = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz_and_order", (q) => q.eq("quizId", question.quizId))
      .take(50);
    await ctx.db.patch(question.quizId, { questionCount: remaining.length });
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
      questionCount: 0,
    });
  },
});
