import { mutation } from "./_generated/server";
import { maths } from "./curriculum/maths";
import { english } from "./curriculum/english";
import { science } from "./curriculum/science";
import { history } from "./curriculum/history";
import { aics } from "./curriculum/aics";
import { gamedev } from "./curriculum/gamedev";
import { homemaking } from "./curriculum/homemaking";
import { building } from "./curriculum/building";
import type { Block, Question, SubjectCurriculum } from "./curriculum/types";
import { deriveInteractive } from "./curriculum/derive";

/**
 * One-off seed: rich multi-lesson curriculum for every subject. Each TOPIC is
 * now a multi-lesson unit (4–8 lessons). Each lesson gets structured `content`
 * blocks (heading + text + example + keyPoints + 1 interactive) plus a
 * 5-question MCQ quiz. Idempotent — skips any lesson whose title already exists
 * under the subject, so it can be re-run safely as more content is authored.
 *
 *   npx convex run seedRichCurriculum:seedRichCurriculum
 *
 * After running, regenerate the calendar so it picks up the new lessons:
 *   npx convex run calendar:generateYear
 */
const CURRICULA: SubjectCurriculum[] = [
  maths,
  english,
  science,
  history,
  aics,
  gamedev,
  homemaking,
  building,
];

export const seedRichCurriculum = mutation({
  args: {},
  handler: async (ctx) => {
    let createdLessons = 0;
    let createdQuestions = 0;
    let skipped = 0;

    for (const subjectBlock of CURRICULA) {
      const subject = await ctx.db
        .query("subjects")
        .withIndex("by_slug", (q) => q.eq("slug", subjectBlock.slug))
        .unique();
      if (!subject) {
        console.warn(`Subject not found: ${subjectBlock.slug}`);
        continue;
      }

      const existing = await ctx.db
        .query("lessons")
        .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
        .take(500);
      const have = new Set(existing.map((l) => l.title));

      const topics = await ctx.db
        .query("topics")
        .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
        .take(100);
      const topicById = new Map(topics.map((t) => [t.name, t._id]));
      let maxOrder = topics.reduce((m, t) => Math.max(m, t.order), -1);

      // Ensure declared topics exist (appended after existing ones).
      for (const spec of subjectBlock.topics ?? []) {
        if (topicById.has(spec.name)) continue;
        maxOrder += 1;
        const id = await ctx.db.insert("topics", {
          subjectId: subject._id,
          name: spec.name,
          description: spec.description,
          order: maxOrder,
          difficultyLevel: spec.difficulty,
        });
        topicById.set(spec.name, id);
      }

      // Auto-create any topic referenced by a lesson but still missing.
      for (const entry of subjectBlock.lessons) {
        if (topicById.has(entry.topic)) continue;
        maxOrder += 1;
        const id = await ctx.db.insert("topics", {
          subjectId: subject._id,
          name: entry.topic,
          description: `Key skills and practice for ${entry.topic}.`,
          order: maxOrder,
          difficultyLevel: entry.difficulty,
        });
        topicById.set(entry.topic, id);
      }

      for (const entry of subjectBlock.lessons) {
        const topicId = topicById.get(entry.topic);
        if (!topicId) {
          console.warn(
            `Topic not found: ${entry.topic} in ${subjectBlock.slug}`,
          );
          skipped += 1;
          continue;
        }
        if (have.has(entry.title)) {
          skipped += 1;
          continue;
        }

        // Ensure every teaching lesson ships with at least one interactive
        // activity. Activity lessons and lessons that already author one are
        // left as-is; otherwise derive one from the lesson's own quiz/key points.
        const blocks: Block[] = [...entry.blocks];
        const hasInteractive = blocks.some((b) => b.type === "interactive");
        if (!hasInteractive && entry.kind !== "activity") {
          const keyPoints = blocks.find(
            (b): b is Extract<Block, { type: "keyPoints" }> => b.type === "keyPoints",
          )?.items;
          const derived = deriveInteractive({
            title: entry.title,
            subjectSlug: subjectBlock.slug,
            questions: entry.questions,
            keyPoints,
          });
          if (derived) blocks.push(derived);
        }

        const now = Date.now();
        const lessonId = await ctx.db.insert("lessons", {
          subjectId: subject._id,
          topicId,
          title: entry.title,
          slug: `${subjectBlock.slug}-${entry.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          description: entry.summary,
          lessonNotes: toFallbackNotes(entry.summary, entry.blocks),
          content: toContent(blocks),
          kind: entry.kind ?? "lesson",
          videoUrl: "",
          videoProvider: "youtube",
          difficultyLevel: entry.difficulty,
          estimatedMinutes: entry.minutes,
          pointsAwarded: entry.points,
          status: "published",
          createdAt: now,
          updatedAt: now,
        });
        createdLessons += 1;
        have.add(entry.title);

        if (entry.questions.length > 0) {
          const quizId = await ctx.db.insert("quizzes", {
            lessonId,
            subjectId: subject._id,
            topicId,
            title: `${entry.title} — Quiz`,
            type: "lesson",
            difficultyLevel: entry.difficulty,
            pointsAwarded: entry.points,
          });
          for (let qi = 0; qi < entry.questions.length; qi++) {
            const q: Question = entry.questions[qi];
            await ctx.db.insert("quizQuestions", {
              quizId,
              questionText: q.q,
              questionType: "mcq",
              options: q.options,
              correctAnswer: q.answer,
              explanation: q.explain,
              difficultyLevel: entry.difficulty,
              order: qi,
            });
            createdQuestions += 1;
          }
        }
      }
    }

    return { createdLessons, createdQuestions, skipped };
  },
});

/** Convert teaching blocks into Convex content-block shape (plain objects). */
function toContent(blocks: Block[]) {
  return blocks.map((b) => {
    switch (b.type) {
      case "heading":
        return { type: "heading" as const, text: b.text };
      case "text":
        return { type: "text" as const, text: b.text };
      case "example":
        return { type: "example" as const, text: b.text };
      case "keyPoints":
        return { type: "keyPoints" as const, items: b.items };
      case "interactive":
        return {
          type: "interactive" as const,
          variant: b.variant,
          data: b.data,
        };
    }
  });
}

/** Plain-text fallback used when content blocks aren't rendered (search,
 *  snippets). Summary + the key points. */
function toFallbackNotes(summary: string, blocks: Block[]): string {
  const kp = blocks.find((b): b is Extract<Block, { type: "keyPoints" }> => b.type === "keyPoints");
  const points = kp ? `\n\nKey points:\n${kp.items.map((i) => `• ${i}`).join("\n")}` : "";
  return summary + points;
}
