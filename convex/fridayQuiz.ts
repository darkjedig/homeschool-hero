import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireParent } from "./authHelpers";
import type { Id } from "./_generated/dataModel";

const QUESTIONS_PER_FRIDAY = 10;

/** Monday 00:00 timestamp for the week containing `now`. */
function weekStart(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun .. 1 Mon
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d.getTime();
}

function weekEnd(start: number): number {
  return start + 7 * 24 * 3600 * 1000 - 1;
}

/** Deterministic shuffle (seeded by number) so a week's quiz is stable. */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The current week's Friday challenge with its sampled questions (student-facing). */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const start = weekStart(Date.now());
    const fq = await ctx.db
      .query("fridayQuizzes")
      .withIndex("by_week", (q) => q.eq("weekStartDate", String(start)))
      .unique();
    if (!fq) return null;
    const qDocs = await Promise.all(
      fq.questionIds.slice(0, QUESTIONS_PER_FRIDAY).map((id) => ctx.db.get(id)),
    );
    const questions = qDocs.filter((q): q is NonNullable<typeof q> => q !== null);

    // Attach subjectId per question (via its quiz) for strong/weak analysis.
    const quizSubject = new Map<string, string>();
    for (const q of questions) {
      if (!quizSubject.has(q.quizId)) {
        const quiz = await ctx.db.get(q.quizId);
        quizSubject.set(q.quizId, quiz?.subjectId ?? "");
      }
    }
    return {
      fridayQuiz: fq,
      questions: questions.map((q) => ({
        ...q,
        subjectId: quizSubject.get(q.quizId) ?? "",
      })),
    };
  },
});

/**
 * Generate this week's Friday Challenge (idempotent). Samples questions from
 * lessons completed in the prior week; falls back to any published-lesson
 * questions so the challenge works as soon as the parent publishes content.
 */
export const generateForWeek = internalMutation({
  args: {},
  handler: async (ctx): Promise<Id<"fridayQuizzes">> => {
    const now = Date.now();
    const start = weekStart(now);
    const end = weekEnd(start);

    // Idempotent: skip if this week already has a challenge.
    const existing = await ctx.db
      .query("fridayQuizzes")
      .withIndex("by_week", (q) => q.eq("weekStartDate", String(start)))
      .unique();
    if (existing) return existing._id;

    const priorWeekStart = start - 7 * 24 * 3600 * 1000;

    // Lessons completed in the prior week.
    const recentProgress = await ctx.db
      .query("videoProgress")
      .withIndex("by_user")
      .filter((q) =>
        q.and(
          q.gte(q.field("updatedAt"), priorWeekStart),
          q.lt(q.field("updatedAt"), start),
        ),
      )
      .take(200);
    const recentLessonIds = new Set(
      recentProgress.filter((p) => p.completed).map((p) => p.lessonId),
    );

    const candidateIds = new Set<string>();
    const subjectsIncluded = new Set<string>();

    const collectFromLesson = async (lessonId: Id<"lessons">) => {
      const lesson = await ctx.db.get(lessonId);
      if (!lesson || lesson.status !== "published") return;
      if (lesson.subjectId) subjectsIncluded.add(lesson.subjectId);
      const quiz = await ctx.db
        .query("quizzes")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
        .filter((q) => q.eq(q.field("type"), "lesson"))
        .unique();
      if (!quiz) return;
      const qs = await ctx.db
        .query("quizQuestions")
        .withIndex("by_quiz_and_order", (q) => q.eq("quizId", quiz._id))
        .take(20);
      for (const qdoc of qs) candidateIds.add(qdoc._id);
    };

    for (const lid of recentLessonIds) await collectFromLesson(lid);

    // Fallback: pull from all published lessons if the prior week was thin.
    if (candidateIds.size < QUESTIONS_PER_FRIDAY) {
      const published = await ctx.db
        .query("lessons")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .take(50);
      for (const l of published) {
        if (candidateIds.size >= 40) break;
        await collectFromLesson(l._id);
      }
    }

    const shuffled = seededShuffle([...candidateIds], start).slice(
      0,
      QUESTIONS_PER_FRIDAY,
    );

    const titleDate = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return await ctx.db.insert("fridayQuizzes", {
      weekStartDate: String(start),
      weekEndDate: String(end),
      title: `Friday Challenge — week of ${titleDate}`,
      questionIds: shuffled as Id<"quizQuestions">[],
      subjectsIncluded: [...subjectsIncluded] as Id<"subjects">[],
      doublePoints: true,
      status: shuffled.length > 0 ? "active" : "scheduled",
    });
  },
});

/** Dev/manual trigger to generate this week's challenge now (parent-only). */
export const generateCurrentWeek = mutation({
  args: {},
  handler: async (ctx): Promise<Id<"fridayQuizzes">> => {
    await requireParent(ctx);
    return await ctx.runMutation(internal.fridayQuiz.generateForWeek, {});
  },
});

type AwardedBadge = { key: string; title: string; icon: string; pointsBonus: number };

/** Submit a Friday challenge attempt and award DOUBLE points. Auth required. */
export const submitFriday = mutation({
  args: {
    fridayQuizId: v.id("fridayQuizzes"),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        selectedAnswer: v.string(),
        correct: v.boolean(),
      }),
    ),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    percentage: number;
    pointsEarned: number;
    correct: number;
    total: number;
    newBadges: AwardedBadge[];
  }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const fq = await ctx.db.get(args.fridayQuizId);
    if (!fq) throw new Error("Friday challenge not found");

    const correct = args.answers.filter((a) => a.correct).length;
    const total = args.answers.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    // Base 20 pts per correct, doubled for Friday.
    const basePoints = correct * 20;
    const pointsEarned = fq.doublePoints ? basePoints * 2 : basePoints;

    await ctx.db.insert("quizAttempts", {
      userId,
      fridayQuizId: args.fridayQuizId,
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
        sourceType: "friday_quiz",
        sourceId: args.fridayQuizId,
        points: pointsEarned,
        description: `${fq.title} (${fq.doublePoints ? "2× points" : "points"})`,
        createdAt: Date.now(),
      });
    }

    const newBadges = await ctx.runMutation(internal.badges.checkAndAward, {
      userId,
    });
    return { percentage, pointsEarned, correct, total, newBadges };
  },
});

/** Past Friday attempts for the parent view (parent-only). */
export const listHistory = query({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    return await ctx.db
      .query("quizAttempts")
      .withIndex("by_friday_quiz")
      .take(100);
  },
});
