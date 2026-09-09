import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { Infer } from "convex/values";
import { contentBlocks } from "../schema";

export type LessonContent = Infer<typeof contentBlocks>;

export type LessonBodyFields = {
  content?: LessonContent;
  lessonNotes: string;
};

export type LessonMeta = {
  subjectId: Id<"subjects">;
  topicId: Id<"topics">;
  title: string;
  slug: string;
  description: string;
  kind?: "lesson" | "activity";
  videoUrl: string;
  videoProvider: "youtube";
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  pointsAwarded: number;
  status: "draft" | "published";
  createdBy?: Id<"users">;
  createdAt: number;
  updatedAt: number;
};

export type HydratedLesson = Doc<"lessons"> & {
  content?: LessonContent;
  lessonNotes: string;
};

export async function getLessonBody(
  ctx: QueryCtx | MutationCtx,
  lessonId: Id<"lessons">,
): Promise<Doc<"lessonBodies"> | null> {
  return await ctx.db
    .query("lessonBodies")
    .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
    .unique();
}

export async function hydrateLesson(
  ctx: QueryCtx | MutationCtx,
  lesson: Doc<"lessons">,
): Promise<HydratedLesson> {
  const body = await getLessonBody(ctx, lesson._id);
  return {
    ...lesson,
    content: body?.content ?? lesson.content,
    lessonNotes: body?.lessonNotes ?? lesson.lessonNotes ?? "",
  };
}

export async function upsertLessonBody(
  ctx: MutationCtx,
  lessonId: Id<"lessons">,
  body: LessonBodyFields,
): Promise<void> {
  const existing = await getLessonBody(ctx, lessonId);
  const now = Date.now();
  if (existing) {
    await ctx.db.patch(existing._id, {
      content: body.content,
      lessonNotes: body.lessonNotes,
      updatedAt: now,
    });
    return;
  }
  await ctx.db.insert("lessonBodies", {
    lessonId,
    content: body.content,
    lessonNotes: body.lessonNotes,
    updatedAt: now,
  });
}

/** Rewrite the lesson row without `content` / `lessonNotes`. */
export async function stripLessonFatFields(
  ctx: MutationCtx,
  lesson: Doc<"lessons">,
): Promise<boolean> {
  if (lesson.content === undefined && lesson.lessonNotes === undefined) {
    return false;
  }
  await ctx.db.replace(lesson._id, {
    subjectId: lesson.subjectId,
    topicId: lesson.topicId,
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    kind: lesson.kind,
    videoUrl: lesson.videoUrl,
    videoProvider: lesson.videoProvider,
    difficultyLevel: lesson.difficultyLevel,
    estimatedMinutes: lesson.estimatedMinutes,
    pointsAwarded: lesson.pointsAwarded,
    status: lesson.status,
    createdBy: lesson.createdBy,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  });
  return true;
}

export async function insertLessonWithBody(
  ctx: MutationCtx,
  meta: LessonMeta,
  body: LessonBodyFields,
): Promise<Id<"lessons">> {
  const lessonId = await ctx.db.insert("lessons", meta);
  await upsertLessonBody(ctx, lessonId, body);
  return lessonId;
}

export async function deleteLessonBody(
  ctx: MutationCtx,
  lessonId: Id<"lessons">,
): Promise<void> {
  const body = await getLessonBody(ctx, lessonId);
  if (body) await ctx.db.delete(body._id);
}

export async function patchLessonContent(
  ctx: MutationCtx,
  lesson: Doc<"lessons">,
  content: LessonContent,
  extraNotes?: string,
): Promise<void> {
  const hydrated = await hydrateLesson(ctx, lesson);
  await upsertLessonBody(ctx, lesson._id, {
    content,
    lessonNotes: extraNotes ?? hydrated.lessonNotes,
  });
  if (lesson.content !== undefined || lesson.lessonNotes !== undefined) {
    const fresh = await ctx.db.get(lesson._id);
    if (fresh) await stripLessonFatFields(ctx, fresh);
  }
  await ctx.db.patch(lesson._id, { updatedAt: Date.now() });
}

export async function syncCalendarLessonMeta(
  ctx: MutationCtx,
  lessonId: Id<"lessons">,
  title: string,
  pointsAwarded: number,
): Promise<void> {
  const entries = await ctx.db
    .query("calendarEntries")
    .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
    .take(200);
  for (const e of entries) {
    await ctx.db.patch(e._id, { lessonTitle: title, pointsAwarded });
  }
}

export function projectLessonCard(lesson: Doc<"lessons">) {
  return {
    _id: lesson._id,
    title: lesson.title,
    topicId: lesson.topicId,
    subjectId: lesson.subjectId,
    estimatedMinutes: lesson.estimatedMinutes,
    pointsAwarded: lesson.pointsAwarded,
    difficultyLevel: lesson.difficultyLevel,
    kind: lesson.kind ?? "lesson",
    status: lesson.status,
    description: lesson.description,
    slug: lesson.slug,
  };
}
