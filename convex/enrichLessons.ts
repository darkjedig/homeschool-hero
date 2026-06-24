import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { deriveInteractive } from "./curriculum/derive";
import type { Question } from "./curriculum/types";

/**
 * Ensure existing teaching lessons each carry at least ONE logged interactive
 * activity, so most lessons are hands-on and every school day surfaces a couple
 * of interactive lessons. Activities are derived from each lesson's OWN content
 * (its quiz Q&A, or key points as a fallback), so they're always relevant and
 * need no manual authoring:
 *
 *   - Maths lessons gain a generative "Speed Drill" arena matched to the topic.
 *   - Other subjects gain a flashcard revision deck or a quick-check MCQ.
 *
 * Idempotent: lessons that already have an interactive block are left untouched,
 * so it's safe to re-run after authoring new content.
 *
 *   npx convex run enrichLessons:ensureInteractivePractice
 */
type ContentBlock = NonNullable<Doc<"lessons">["content"]>[number];

export const ensureInteractivePractice = mutation({
  args: {},
  handler: async (ctx, _args) => {
    void _args;
    const lessons = await ctx.db.query("lessons").take(2000);

    let teaching = 0;
    let alreadyInteractive = 0;
    let enriched = 0;
    let unchanged = 0; // teaching lessons we couldn't derive an activity for

    for (const lesson of lessons) {
      if (lesson.kind === "activity") {
        alreadyInteractive += 1; // activity lessons are interactive by definition
        continue;
      }
      teaching += 1;

      const content: ContentBlock[] = [...(lesson.content ?? [])];
      const hasInteractive = content.some((b) => b.type === "interactive");
      if (hasInteractive) {
        alreadyInteractive += 1;
        continue;
      }

      const subject = await ctx.db.get(lesson.subjectId);
      const questions = await getQuizQuestions(ctx, lesson._id);
      const keyPoints = content.find((b) => b.type === "keyPoints")?.items;

      const derived = deriveInteractive({
        title: lesson.title,
        subjectSlug: subject?.slug ?? "",
        questions,
        keyPoints,
      });

      if (!derived || derived.type !== "interactive") {
        unchanged += 1;
        continue;
      }

      await ctx.db.patch(lesson._id, {
        content: [
          ...content,
          { type: "interactive" as const, variant: derived.variant, data: derived.data },
        ],
        updatedAt: Date.now(),
      });
      enriched += 1;
    }

    const totalLessons = lessons.length;
    const interactiveLessons = alreadyInteractive + enriched;
    const coveragePct =
      totalLessons > 0 ? Math.round((interactiveLessons / totalLessons) * 100) : 0;

    return {
      totalLessons,
      teaching,
      alreadyInteractive,
      enriched,
      unchanged,
      interactiveLessons,
      coveragePct,
    };
  },
});

async function getQuizQuestions(
  ctx: MutationCtx,
  lessonId: Id<"lessons">,
): Promise<Question[]> {
  const quiz = await ctx.db
    .query("quizzes")
    .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
    .filter((q) => q.eq(q.field("type"), "lesson"))
    .unique();
  if (!quiz) return [];
  const rows = await ctx.db
    .query("quizQuestions")
    .withIndex("by_quiz_and_order", (q) => q.eq("quizId", quiz._id))
    .take(20);
  return rows.map((r) => ({
    q: r.questionText,
    options: r.options,
    answer: r.correctAnswer,
    explain: r.explanation,
  }));
}

/** Human Body lesson titles → simulation id + display title. */
const BODY_SIM_PATCHES: { title: string; sim: string; simTitle: string }[] = [
  { title: "The Heart & Blood", sim: "heart", simTitle: "How the Heart Pumps Blood" },
  { title: "The Lungs & Breathing", sim: "lungs", simTitle: "Breathing Simulator" },
  { title: "Bones & Muscles", sim: "skeleton", simTitle: "Bones & Muscles in Motion" },
  { title: "The Digestive System", sim: "digestive", simTitle: "Food's Journey" },
  { title: "The Brain & Nerves", sim: "brain", simTitle: "Nerve Signal Reflex" },
];

/**
 * Attach animated body-system simulations to the five Human Body science lessons.
 * Idempotent — skips lessons that already contain the matching sim id.
 *
 *   npx convex run enrichLessons:attachBodySimulations
 */
export const attachBodySimulations = mutation({
  args: {},
  handler: async (ctx, _args) => {
    void _args;
    let patched = 0;
    let skipped = 0;

    const allLessons = await ctx.db.query("lessons").take(500);
    const byTitle = new Map(allLessons.map((l) => [l.title, l]));

    for (const spec of BODY_SIM_PATCHES) {
      const lesson = byTitle.get(spec.title);
      if (!lesson) {
        skipped += 1;
        continue;
      }

      const content: ContentBlock[] = [...(lesson.content ?? [])];
      const hasSim = content.some(
        (b) =>
          b.type === "interactive" &&
          b.variant === "simulation" &&
          b.data?.some((d) => d.key === "sim" && d.value === spec.sim),
      );
      if (hasSim) {
        skipped += 1;
        continue;
      }

      const simBlock: ContentBlock = {
        type: "interactive",
        variant: "simulation",
        data: [
          { key: "sim", value: spec.sim },
          { key: "title", value: spec.simTitle },
        ],
      };

      // Insert after keyPoints (or after last heading block) so the animation
      // appears right after the teaching content.
      const kpIdx = content.findIndex((b) => b.type === "keyPoints");
      const insertAt = kpIdx >= 0 ? kpIdx + 1 : content.length;
      content.splice(insertAt, 0, simBlock);

      await ctx.db.patch(lesson._id, {
        content,
        updatedAt: Date.now(),
      });
      patched += 1;
    }

    return { patched, skipped, total: BODY_SIM_PATCHES.length };
  },
});
