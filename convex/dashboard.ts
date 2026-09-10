import { householdStudentUserId, requireParent } from "./authHelpers";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { loadCompletion } from "./lib/completion";
import type { LessonActivity } from "./lib/completion";

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

export type EnrichedVideo = {
  progressId: Id<"videoProgress">;
  lessonId: Id<"lessons">;
  lessonTitle: string;
  subjectName: string | null;
  subjectColor: string | null;
  secondsWatched: number;
  durationSeconds: number | null;
  percentageWatched: number;
  completed: boolean;
  updatedAt: number;
};

async function enrichVideoProgress(
  ctx: QueryCtx,
  rows: Doc<"videoProgress">[],
): Promise<EnrichedVideo[]> {
  const out: EnrichedVideo[] = [];
  const subjectCache = new Map<string, { name: string; color: string } | null>();
  for (const row of rows) {
    const lesson = await ctx.db.get(row.lessonId);
    let subjectName: string | null = null;
    let subjectColor: string | null = null;
    if (lesson) {
      let subject = subjectCache.get(lesson.subjectId);
      if (subject === undefined) {
        const doc = await ctx.db.get(lesson.subjectId);
        subject = doc ? { name: doc.name, color: doc.color } : null;
        subjectCache.set(lesson.subjectId, subject);
      }
      subjectName = subject?.name ?? null;
      subjectColor = subject?.color ?? null;
    }
    out.push({
      progressId: row._id,
      lessonId: row.lessonId,
      lessonTitle: lesson?.title ?? "Lesson",
      subjectName,
      subjectColor,
      secondsWatched: row.secondsWatched,
      durationSeconds: row.durationSeconds ?? null,
      percentageWatched: row.percentageWatched,
      completed: row.completed,
      updatedAt: row.updatedAt,
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
    const studentId = await householdStudentUserId(ctx);
    const [subjects, published, drafts, quizzes, attempts, rewards, redemptions, points, videoFetched] =
      await Promise.all([
        ctx.db.query("subjects").withIndex("by_active_order").take(50),
        ctx.db
          .query("lessons")
          .withIndex("by_status", (q) => q.eq("status", "published"))
          .take(800),
        ctx.db
          .query("lessons")
          .withIndex("by_status", (q) => q.eq("status", "draft"))
          .take(100),
        ctx.db.query("quizzes").withIndex("by_type", (q) => q.eq("type", "lesson")).take(400),
        studentId
          ? ctx.db
              .query("quizAttempts")
              .withIndex("by_user", (q) => q.eq("userId", studentId))
              .take(500)
          : Promise.resolve([] as Doc<"quizAttempts">[]),
        ctx.db.query("rewards").withIndex("by_active").take(100),
        ctx.db.query("rewardRedemptions").withIndex("by_status").take(200),
        studentId
          ? ctx.db
              .query("pointsLedger")
              .withIndex("by_user", (q) => q.eq("userId", studentId))
              .take(1000)
          : Promise.resolve([] as Doc<"pointsLedger">[]),
        studentId
          ? ctx.db
              .query("videoProgress")
              .withIndex("by_user", (q) => q.eq("userId", studentId))
              .take(200)
          : Promise.resolve([] as Doc<"videoProgress">[]),
      ]);

    let videoRows = videoFetched;
    // Single-student household: if the student pin isn't mapped yet, still
    // surface any logged watch time so the parent dashboard isn't empty.
    if (videoRows.length === 0) {
      videoRows = await ctx.db.query("videoProgress").take(200);
    }

    const publishedCount = published.length;
    const draftCount = drafts.length;
    const totalPoints = points.reduce((s, p) => s + p.points, 0);
    const avgScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length,
          )
        : 0;

    const publishedBySubject = new Map<string, number>();
    for (const l of published) {
      publishedBySubject.set(l.subjectId, (publishedBySubject.get(l.subjectId) ?? 0) + 1);
    }
    const lessonsBySubject = subjects.map((s) => ({
      slug: s.slug,
      name: s.name,
      color: s.color,
      lessons: publishedBySubject.get(s._id) ?? 0,
    }));

    const recent = attempts
      .slice()
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 8);
    const recentAttempts = await enrichAttempts(ctx, recent);

    const recentVideo = await enrichVideoProgress(
      ctx,
      videoRows.slice().sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 12),
    );
    const videoCompleted = videoRows.filter((v) => v.completed).length;
    const videoSeconds = videoRows.reduce((s, v) => s + v.secondsWatched, 0);

    const completion = studentId
      ? await loadCompletion(ctx, studentId)
      : {
          byLesson: new Map<Id<"lessons">, LessonActivity>(),
          completedIds: new Set<Id<"lessons">>(),
        };
    const recentCompleted = [...completion.byLesson.values()]
      .filter((r) => r.completed)
      .sort((a, b) => b.lastAt - a.lastAt)
      .slice(0, 8);
    const recentCompletedLessons = [];
    for (const row of recentCompleted) {
      const lesson = await ctx.db.get("lessons", row.lessonId);
      const subject = lesson
        ? subjects.find((s) => s._id === lesson.subjectId)
        : undefined;
      recentCompletedLessons.push({
        lessonId: row.lessonId,
        lessonTitle: lesson?.title ?? "Lesson",
        subjectName: subject?.name ?? null,
        subjectColor: subject?.color ?? null,
        videoDone: row.videoDone,
        quizDone: row.quizDone,
        interactiveDone: row.interactiveDone,
        lastAt: row.lastAt,
      });
    }

    return {
      counts: {
        subjects: subjects.length,
        publishedLessons: publishedCount,
        draftLessons: draftCount,
        quizzes: quizzes.length,
        attempts: attempts.length,
        rewards: rewards.length,
        redemptions: redemptions.length,
        videosWatched: videoRows.length,
        videosCompleted: videoCompleted,
        lessonsCompleted: completion.completedIds.size,
      },
      totalPoints,
      avgScore,
      recentAttempts,
      lessonsBySubject,
      recentVideo,
      videoSeconds,
      recentCompletedLessons,
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

function computeStreaks(days: Set<string>, now: number): { current: number; best: number } {
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
  const today = localDay(now);
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

type Chrome = {
  points: number;
  pointsThisWeek: number;
  level: number;
  levelTitle: string;
  levelProgress: number;
  xpIntoLevel: number;
  xpForLevel: number;
  streak: number;
  bestStreak: number;
  weekActivity: boolean[];
  weekTodayIndex: number;
};

async function loadChrome(
  ctx: QueryCtx,
  userId: Id<"users">,
  now: number,
): Promise<{
  chrome: Chrome;
  attempts: Doc<"quizAttempts">[];
  progressRows: Doc<"videoProgress">[];
  completedLessonIds: Set<Id<"lessons">>;
}> {
  const [attempts, progressRows, points, interactives] = await Promise.all([
    ctx.db.query("quizAttempts").withIndex("by_user", (q) => q.eq("userId", userId)).take(500),
    ctx.db.query("videoProgress").withIndex("by_user", (q) => q.eq("userId", userId)).take(500),
    ctx.db.query("pointsLedger").withIndex("by_user", (q) => q.eq("userId", userId)).take(1000),
    ctx.db.query("interactiveResults").withIndex("by_user", (q) => q.eq("userId", userId)).take(500),
  ]);
  const totalPoints = points.reduce((s, p) => s + p.points, 0);
  const weekStart = weekStartMs(now);
  const pointsThisWeek = points
    .filter((p) => p.createdAt >= weekStart)
    .reduce((s, p) => s + p.points, 0);
  const level = Math.floor(totalPoints / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalPoints % XP_PER_LEVEL;
  const levelProgress = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);

  const activityDays = new Set<string>();
  for (const p of progressRows) if (p.completed) activityDays.add(localDay(p.updatedAt));
  for (const a of attempts) activityDays.add(localDay(a.completedAt));
  for (const i of interactives) if (i.completed) activityDays.add(localDay(i.createdAt));
  const { current: streak, best: bestStreak } = computeStreaks(activityDays, now);

  const mondayKey = localDay(weekStart);
  const weekActivity: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    weekActivity.push(activityDays.has(shiftLocalDay(mondayKey, i)));
  }
  const weekTodayIndex = (new Date(now).getDay() + 6) % 7;

  return {
    chrome: {
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
    },
    attempts,
    progressRows,
    completedLessonIds: (await loadCompletion(ctx, userId)).completedIds,
  };
}

/** Sidebar-only: points, level, streak. Does not scan lessons. */
export const studentChrome = query({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const { chrome } = await loadChrome(ctx, userId, args.now);
    return chrome;
  },
});

export const studentOverview = query({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const now = args.now;

    const { chrome, attempts, progressRows, completedLessonIds } = await loadChrome(
      ctx,
      userId,
      now,
    );

    const [subjects, publishedLessons, lessonQuizzes, fridayQuizzes, badgeRows, allBadges] =
      await Promise.all([
        ctx.db.query("subjects").withIndex("by_active_order").take(50),
        ctx.db
          .query("lessons")
          .withIndex("by_status", (q) => q.eq("status", "published"))
          .take(400),
        ctx.db
          .query("quizzes")
          .withIndex("by_type", (q) => q.eq("type", "lesson"))
          .take(400),
        ctx.db.query("fridayQuizzes").withIndex("by_status").take(50),
        ctx.db.query("studentBadges").withIndex("by_user", (q) => q.eq("userId", userId)).take(50),
        ctx.db.query("badges").withIndex("by_active").take(50),
      ]);

    const monday = utcMondayISO(now);
    const sunday = isoPlusDays(monday, 6);
    const weekEntries = await ctx.db
      .query("calendarEntries")
      .withIndex("by_date", (q) => q.gte("date", monday).lte("date", sunday))
      .take(60);
    const plannedIds = new Set(
      weekEntries.filter((e) => e.lessonId).map((e) => e.lessonId!),
    );
    let weeklyDone = 0;
    for (const id of plannedIds) if (completedLessonIds.has(id)) weeklyDone += 1;
    const weeklyPlanned = plannedIds.size;
    const weeklyGoalPct =
      weeklyPlanned > 0 ? Math.round((weeklyDone / weeklyPlanned) * 100) : 0;

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

    const weekStart = String(weekStartMs(now));
    const fq = await ctx.db
      .query("fridayQuizzes")
      .withIndex("by_week", (q) => q.eq("weekStartDate", weekStart))
      .unique();
    const friday = fq
      ? { title: fq.title, subtitle: `${fq.questionIds.length} questions · 2× points` }
      : null;

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

    const completedPublished = publishedLessons.filter((l) =>
      completedLessonIds.has(l._id),
    ).length;
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
      ...chrome,
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
