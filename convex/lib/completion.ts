import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export type LessonActivity = {
  lessonId: Id<"lessons">;
  videoDone: boolean;
  videoPct: number | null;
  quizDone: boolean;
  quizPct: number | null;
  interactiveDone: boolean;
  interactiveCount: number;
  marked: boolean;
  completed: boolean;
  lastAt: number;
};

export type CompletionIndex = {
  byLesson: Map<Id<"lessons">, LessonActivity>;
  completedIds: Set<Id<"lessons">>;
};

function emptyActivity(lessonId: Id<"lessons">): LessonActivity {
  return {
    lessonId,
    videoDone: false,
    videoPct: null,
    quizDone: false,
    quizPct: null,
    interactiveDone: false,
    interactiveCount: 0,
    marked: false,
    completed: false,
    lastAt: 0,
  };
}

function ensure(
  map: Map<Id<"lessons">, LessonActivity>,
  lessonId: Id<"lessons">,
): LessonActivity {
  let row = map.get(lessonId);
  if (!row) {
    row = emptyActivity(lessonId);
    map.set(lessonId, row);
  }
  return row;
}

function finalize(row: LessonActivity): void {
  row.completed =
    row.marked || row.videoDone || row.quizDone || row.interactiveDone;
}

/**
 * A lesson is complete when Hudson finished any of: the video (90%+),
 * the lesson quiz, an interactive (flashcards etc), or a parent mark.
 */
export async function loadCompletion(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<CompletionIndex> {
  const [videos, attempts, interactives, marked] = await Promise.all([
    ctx.db
      .query("videoProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500),
    ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500),
    ctx.db
      .query("interactiveResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500),
    ctx.db
      .query("lessonCompletions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500),
  ]);

  const byLesson = new Map<Id<"lessons">, LessonActivity>();

  for (const v of videos) {
    const row = ensure(byLesson, v.lessonId);
    row.videoDone = v.completed || v.percentageWatched >= 90;
    row.videoPct = Math.round(v.percentageWatched);
    row.lastAt = Math.max(row.lastAt, v.updatedAt);
  }

  const quizIds = new Set<Id<"quizzes">>();
  for (const a of attempts) {
    if (a.quizId) quizIds.add(a.quizId);
  }
  const quizLesson = new Map<Id<"quizzes">, Id<"lessons">>();
  for (const qid of quizIds) {
    const quiz = await ctx.db.get(qid);
    if (quiz) quizLesson.set(qid, quiz.lessonId);
  }
  for (const a of attempts) {
    if (!a.quizId) continue;
    const lessonId = quizLesson.get(a.quizId);
    if (!lessonId) continue;
    const row = ensure(byLesson, lessonId);
    row.quizDone = true;
    row.quizPct = Math.max(row.quizPct ?? 0, a.percentage);
    row.lastAt = Math.max(row.lastAt, a.completedAt);
  }

  for (const i of interactives) {
    if (!i.completed) continue;
    const row = ensure(byLesson, i.lessonId);
    row.interactiveDone = true;
    row.interactiveCount += 1;
    row.lastAt = Math.max(row.lastAt, i.createdAt);
  }

  for (const m of marked) {
    const row = ensure(byLesson, m.lessonId);
    row.marked = true;
    row.lastAt = Math.max(row.lastAt, m.completedAt);
  }

  const completedIds = new Set<Id<"lessons">>();
  for (const row of byLesson.values()) {
    finalize(row);
    if (row.completed) completedIds.add(row.lessonId);
  }

  return { byLesson, completedIds };
}

export async function markLessonsComplete(
  ctx: MutationCtx,
  userId: Id<"users">,
  lessonIds: Id<"lessons">[],
  via: "parent" | "student",
  date?: string,
): Promise<{ marked: number; titles: string[] }> {
  const now = Date.now();
  const titles: string[] = [];
  let marked = 0;
  for (const lessonId of lessonIds) {
    const existing = await ctx.db
      .query("lessonCompletions")
      .withIndex("by_user_and_lesson", (q) =>
        q.eq("userId", userId).eq("lessonId", lessonId),
      )
      .unique();
    const lesson = await ctx.db.get(lessonId);
    if (lesson) titles.push(lesson.title);
    if (existing) continue;
    await ctx.db.insert("lessonCompletions", {
      userId,
      lessonId,
      completedAt: now,
      via,
      date,
    });
    marked += 1;
  }
  return { marked, titles };
}
