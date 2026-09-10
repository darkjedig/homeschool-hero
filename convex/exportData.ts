import { internalQuery } from "./_generated/server";
import { requireParent } from "./authHelpers";

/**
 * Aggregate all learning data for export (parent-only, internal). Joins human
 * names onto every record so the exported CSV/JSON never shows bare ids — a
 * quiz attempt carries its quiz/lesson/subject name, video progress carries
 * its lesson title, and a redemption carries its reward title.
 */
export const allData = internalQuery({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    const [
      subjects,
      lessons,
      quizzes,
      attempts,
      videoProgress,
      points,
      redemptions,
      interactiveResults,
      fridayQuizzes,
      rewards,
    ] = await Promise.all([
      ctx.db.query("subjects").take(200),
      ctx.db.query("lessons").take(500),
      ctx.db.query("quizzes").take(500),
      ctx.db.query("quizAttempts").take(1000),
      ctx.db.query("videoProgress").take(1000),
      ctx.db.query("pointsLedger").take(2000),
      ctx.db.query("rewardRedemptions").take(500),
      ctx.db.query("interactiveResults").take(2000),
      ctx.db.query("fridayQuizzes").take(200),
      ctx.db.query("rewards").take(200),
    ]);

    const lessonById = new Map(lessons.map((l) => [l._id, l]));
    const subjectById = new Map(subjects.map((s) => [s._id, s]));
    const quizById = new Map(quizzes.map((q) => [q._id, q]));
    const fridayById = new Map(fridayQuizzes.map((f) => [f._id, f]));
    const rewardById = new Map(rewards.map((r) => [r._id, r]));

    const namedAttempts = attempts.map((a) => {
      let title = "Quiz";
      let lessonTitle: string | null = null;
      let subjectName: string | null = null;
      let type: "lesson" | "friday" = "lesson";
      if (a.fridayQuizId) {
        type = "friday";
        title = fridayById.get(a.fridayQuizId)?.title ?? "Friday Challenge";
      } else if (a.quizId) {
        const q = quizById.get(a.quizId);
        title = q?.title ?? "Quiz";
        if (q) {
          lessonTitle = lessonById.get(q.lessonId)?.title ?? null;
          subjectName = subjectById.get(q.subjectId)?.name ?? null;
        }
      }
      return {
        _id: a._id,
        userId: a.userId,
        title,
        lessonTitle,
        subjectName,
        type,
        correctAnswers: a.correctAnswers,
        totalQuestions: a.totalQuestions,
        percentage: a.percentage,
        pointsEarned: a.pointsEarned,
        completedAt: a.completedAt,
      };
    });

    const namedVideo = videoProgress.map((v) => ({
      _id: v._id,
      userId: v.userId,
      lessonTitle: lessonById.get(v.lessonId)?.title ?? "—",
      percentageWatched: v.percentageWatched,
      completed: v.completed,
      secondsWatched: v.secondsWatched,
      durationSeconds: v.durationSeconds ?? null,
    }));

    const namedRedemptions = redemptions.map((r) => ({
      _id: r._id,
      userId: r.userId,
      rewardTitle: rewardById.get(r.rewardId)?.title ?? "—",
      pointsSpent: r.pointsSpent,
      status: r.status,
      createdAt: r.createdAt,
    }));

    return {
      subjects,
      lessons,
      attempts: namedAttempts,
      videoProgress: namedVideo,
      points,
      redemptions: namedRedemptions,
      interactiveResults,
    };
  },
});
