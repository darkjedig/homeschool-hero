import { requireParent } from "./authHelpers";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * A recent quiz attempt joined to a human-readable name, its lesson/subject,
 * and whether it was a Friday Challenge — so the parent dashboard never shows
 * a raw quiz id. `attemptId` lets the row open a full results view.
 */
export type EnrichedAttempt = {
  attemptId: Id<"quizAttempts">;
  completedAt: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  isFriday: boolean;
  title: string;
  subtitle: string;
  subjectName: string | null;
  subjectColor: string | null;
};

async function enrichAttempts(
  ctx: QueryCtx,
  attempts: Doc<"quizAttempts">[],
): Promise<EnrichedAttempt[]> {
  const out: EnrichedAttempt[] = [];
  for (const a of attempts) {
    let title = "Quiz";
    let subtitle = "";
    let subjectName: string | null = null;
    let subjectColor: string | null = null;
    let isFriday = false;

    if (a.fridayQuizId) {
      isFriday = true;
      const fq = await ctx.db.get(a.fridayQuizId);
      title = fq?.title ?? "Friday Challenge";
      subtitle = "Weekly review";
    } else if (a.quizId) {
      const quiz = await ctx.db.get(a.quizId);
      if (quiz) {
        title = quiz.title;
        const lesson = await ctx.db.get(quiz.lessonId);
        subtitle = lesson?.title ?? "";
        const subj = await ctx.db.get(quiz.subjectId);
        subjectName = subj?.name ?? null;
        subjectColor = subj?.color ?? null;
      }
    }

    out.push({
      attemptId: a._id,
      completedAt: a.completedAt,
      percentage: a.percentage,
      correctAnswers: a.correctAnswers,
      totalQuestions: a.totalQuestions,
      pointsEarned: a.pointsEarned,
      isFriday,
      title,
      subtitle,
      subjectName,
      subjectColor,
    });
  }
  return out;
}

/**
 * Aggregate stats for the parent dashboard. Uses bounded reads; accurate for
 * MVP volumes. All counts derive from live Convex data.
 */
export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    const [subjects, lessons, quizzes, attempts, rewards, redemptions, points] =
      await Promise.all([
        ctx.db.query("subjects").withIndex("by_active_order").take(50),
        ctx.db.query("lessons").withIndex("by_status").take(200),
        ctx.db.query("quizzes").withIndex("by_type").take(200),
        ctx.db.query("quizAttempts").withIndex("by_user").take(500),
        ctx.db.query("rewards").withIndex("by_active").take(100),
        ctx.db.query("rewardRedemptions").withIndex("by_status").take(200),
        ctx.db.query("pointsLedger").withIndex("by_user").take(1000),
      ]);

    const published = lessons.filter((l) => l.status === "published").length;
    const drafts = lessons.length - published;
    const totalPoints = points.reduce((s, p) => s + p.points, 0);
    const avgScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length,
          )
        : 0;

    // Per-subject lesson counts + attempts (for weak-subject detection).
    const bySubject = new Map<
      string,
      { lessons: number; attempts: number; totalPct: number }
    >();
    for (const l of lessons) {
      const e = bySubject.get(l.subjectId) ?? {
        lessons: 0,
        attempts: 0,
        totalPct: 0,
      };
      e.lessons += 1;
      bySubject.set(l.subjectId, e);
    }

    const recent = attempts
      .slice()
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 8);
    const recentAttempts = await enrichAttempts(ctx, recent);

    return {
      counts: {
        subjects: subjects.length,
        publishedLessons: published,
        draftLessons: drafts,
        quizzes: quizzes.length,
        attempts: attempts.length,
        rewards: rewards.length,
        redemptions: redemptions.length,
      },
      totalPoints,
      avgScore,
      recentAttempts,
    };
  },
});

// ──────────────────────────────────────────────────────────────────────────
// Student dashboard — live aggregation. One query returns everything the
// student dashboard needs (points, streak, level, weekly goal, continue
// learning, Friday title, per-subject progress, overall donut). Returns null
// when not authenticated.
// ──────────────────────────────────────────────────────────────────────────

const XP_PER_LEVEL = 250;

function rankFor(level: number): string {
  if (level >= 20) return "Champion";
  if (level >= 15) return "Scholar";
  if (level >= 10) return "Adventurer";
  if (level >= 5) return "Explorer";
  return "Rookie";
}

/** Local-date "YYYY-MM-DD" key for an epoch ms (used for streak/activity days). */
function localDay(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function shiftLocalDay(iso: string, delta: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Monday 00:00 (local) of the week containing `now` — mirrors fridayQuiz.weekStart. */
function weekStartMs(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.getTime();
}

/** Monday's date as a UTC ISO string (calendar entries are stored in UTC ISO). */
function utcMondayISO(now: number): string {
  const d = new Date(now);
  const diff = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

function isoPlusDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function computeStreaks(days: Set<string>): { current: number; best: number } {
  if (days.size === 0) return { current: 0, best: 0 };
  const sorted = [...days].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (shiftLocalDay(sorted[i - 1], 1) === sorted[i]) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  const today = localDay(Date.now());
  const yesterday = shiftLocalDay(today, -1);
  let cursor: string | null = null;
  if (days.has(today)) cursor = today;
  else if (days.has(yesterday)) cursor = yesterday;
  let current = 0;
  while (cursor && days.has(cursor)) {
    current += 1;
    cursor = shiftLocalDay(cursor, -1);
  }
  return { current, best: Math.max(best, current) };
}

export const studentOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const [subjects, lessons, quizzes, fridayQuizzes, attempts, progressRows, points, badgeRows, allBadges] =
      await Promise.all([
        ctx.db.query("subjects").withIndex("by_active_order").take(50),
        ctx.db.query("lessons").take(500),
        ctx.db.query("quizzes").take(500),
        ctx.db.query("fridayQuizzes").take(200),
        ctx.db.query("quizAttempts").withIndex("by_user", (q) => q.eq("userId", userId)).take(500),
        ctx.db.query("videoProgress").withIndex("by_user", (q) => q.eq("userId", userId)).take(500),
        ctx.db.query("pointsLedger").withIndex("by_user", (q) => q.eq("userId", userId)).take(1000),
        ctx.db.query("studentBadges").withIndex("by_user", (q) => q.eq("userId", userId)).take(50),
        ctx.db.query("badges").withIndex("by_active").take(50),
      ]);

    const publishedLessons = lessons.filter((l) => l.status === "published");
    const completedLessonIds = new Set(
      progressRows.filter((p) => p.completed).map((p) => p.lessonId),
    );

    // ── Points + level ──
    const totalPoints = points.reduce((s, p) => s + p.points, 0);
    const weekStart = weekStartMs(Date.now());
    const pointsThisWeek = points
      .filter((p) => p.createdAt >= weekStart)
      .reduce((s, p) => s + p.points, 0);
    const level = Math.floor(totalPoints / XP_PER_LEVEL) + 1;
    const xpIntoLevel = totalPoints % XP_PER_LEVEL;
    const levelProgress = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);

    // ── Streak (a day counts if the student completed a lesson or took a quiz) ──
    const activityDays = new Set<string>();
    for (const p of progressRows) if (p.completed) activityDays.add(localDay(p.updatedAt));
    for (const a of attempts) activityDays.add(localDay(a.completedAt));
    const { current: streak, best: bestStreak } = computeStreaks(activityDays);

    // ── This week's per-day activity (Mon–Sun) for the sidebar streak tracker ──
    const mondayKey = localDay(weekStart);
    const weekActivity: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      weekActivity.push(activityDays.has(shiftLocalDay(mondayKey, i)));
    }
    const weekTodayIndex = (new Date().getDay() + 6) % 7; // 0 = Monday

    // ── Weekly goal (this week's planned lessons completed) ──
    const monday = utcMondayISO(Date.now());
    const sunday = isoPlusDays(monday, 6);
    const weekEntries = await ctx.db
      .query("calendarEntries")
      .withIndex("by_date", (q) => q.gte("date", monday))
      .take(60);
    const plannedIds = new Set(
      weekEntries.filter((e) => e.date <= sunday && e.lessonId).map((e) => e.lessonId!),
    );
    let weeklyDone = 0;
    for (const id of plannedIds) if (completedLessonIds.has(id)) weeklyDone += 1;
    const weeklyPlanned = plannedIds.size;
    const weeklyGoalPct =
      weeklyPlanned > 0 ? Math.round((weeklyDone / weeklyPlanned) * 100) : 0;

    // ── Continue learning: most-recent incomplete lesson (else most-recent overall) ──
    let continueLearning: {
      title: string;
      subject: string;
      lessonNumber: number;
      totalLessons: number;
      progress: number;
      href: string;
    } | null = null;
    const sortedProgress = progressRows.slice().sort((a, b) => b.updatedAt - a.updatedAt);
    const picked = sortedProgress.find((p) => !p.completed) ?? sortedProgress[0] ?? null;
    if (picked) {
      const lesson = await ctx.db.get(picked.lessonId);
      if (lesson) {
        const subject = await ctx.db.get(lesson.subjectId);
        const inSubject = publishedLessons
          .filter((l) => l.subjectId === lesson.subjectId)
          .sort((a, b) => a._creationTime - b._creationTime);
        const idx = inSubject.findIndex((l) => l._id === lesson._id);
        continueLearning = {
          title: lesson.title,
          subject: subject?.name ?? "Subject",
          lessonNumber: idx >= 0 ? idx + 1 : 1,
          totalLessons: inSubject.length,
          progress: picked.completed ? 100 : Math.round(picked.percentageWatched ?? 0),
          href: `/lessons/${lesson._id}`,
        };
      }
    }

    // ── Friday card title ──
    const fq = fridayQuizzes.find((f) => f.weekStartDate === String(weekStart));
    const friday = fq
      ? { title: fq.title, subtitle: `${fq.questionIds.length} questions · 2× points` }
      : null;

    // ── Per-subject progress (Core Subjects) ──
    const subjectProgress = subjects.map((s) => {
      const inSubject = publishedLessons.filter((l) => l.subjectId === s._id);
      const done = inSubject.filter((l) => completedLessonIds.has(l._id)).length;
      return {
        _id: s._id,
        slug: s.slug,
        name: s.name,
        color: s.color,
        icon: s.icon,
        completed: done,
        total: inSubject.length,
        pct: inSubject.length > 0 ? Math.round((done / inSubject.length) * 100) : 0,
      };
    });

    // ── Overall progress donut ──
    const completedPublished = publishedLessons.filter((l) =>
      completedLessonIds.has(l._id),
    ).length;
    const lessonQuizzes = quizzes.filter((q) => q.type === "lesson");
    const distinctQuizzesTaken = new Set(
      attempts.filter((a) => a.quizId).map((a) => a.quizId!),
    ).size;
    const distinctFridayTaken = new Set(
      attempts.filter((a) => a.fridayQuizId).map((a) => a.fridayQuizId!),
    ).size;
    const overall = {
      lessonsPct: publishedLessons.length
        ? Math.round((completedPublished / publishedLessons.length) * 100)
        : 0,
      quizzesPct: lessonQuizzes.length
        ? Math.round((distinctQuizzesTaken / lessonQuizzes.length) * 100)
        : 0,
      challengesPct: fridayQuizzes.length
        ? Math.round((distinctFridayTaken / fridayQuizzes.length) * 100)
        : 0,
      badgesPct: allBadges.length
        ? Math.round((badgeRows.length / allBadges.length) * 100)
        : 0,
    };

    return {
      points: totalPoints,
      pointsThisWeek,
      level,
      levelTitle: rankFor(level),
      levelProgress,
      xpIntoLevel,
      xpForLevel: XP_PER_LEVEL,
      streak,
      bestStreak,
      weekActivity,
      weekTodayIndex,
      weeklyDone,
      weeklyPlanned,
      weeklyGoalPct,
      continueLearning,
      friday,
      subjectProgress,
      overall,
      badgeCount: badgeRows.length,
    };
  },
});
