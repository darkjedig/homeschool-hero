// Pure helpers that derive a relevant interactive activity from a lesson's own
// content (its quiz Q&A or key points). Shared by the seed (new lessons) and the
// enrichLessons mutation (existing lessons) so every lesson can carry at least
// one logged, hands-on interactive without hand-authoring hundreds of blocks.
//
// No Convex server imports here — pure data shapes only.

import { mcq, fc, arena, type Block, type Question } from "./types";

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Pick a topic-matched generative maths drill from the lesson title. */
function arenaForTitle(title: string): Block {
  const t = title.toLowerCase();
  let mode: "add" | "sub" | "mul" | "div" | "mixed" | "fractions" | "percent" = "mixed";
  let min = 2;
  let max = 12;
  let count = 10;
  if (/fraction/.test(t)) { mode = "fractions"; min = 1; max = 12; count = 8; }
  else if (/percent/.test(t)) { mode = "percent"; min = 1; max = 100; count = 8; }
  else if (/divi|divide|division/.test(t)) { mode = "div"; min = 2; max = 12; count = 10; }
  else if (/multipl|times|product/.test(t)) { mode = "mul"; min = 2; max = 12; count = 10; }
  else if (/add|sum|addition/.test(t)) { mode = "add"; min = 2; max = 50; count = 10; }
  else if (/subtract|minus|difference/.test(t)) { mode = "sub"; min = 2; max = 50; count = 10; }
  return arena({ title: `${title} — Speed Drill`, mode, min, max, count });
}

/** Coerce a question's options into exactly four (padding with the answer). */
function ensureFour(options: string[], answer: string): [string, string, string, string] {
  const opts = options.slice(0, 4);
  while (opts.length < 4) opts.push(answer);
  return [opts[0], opts[1], opts[2], opts[3]];
}

/**
 * Derive a single interactive activity block for a lesson, or null if there
 * isn't enough source material. Maths lessons get a generative drill; other
 * subjects alternate between a flashcard revision deck and a quick-check MCQ
 * (both built from the lesson's quiz) for variety.
 */
export function deriveInteractive(opts: {
  title: string;
  subjectSlug: string;
  questions: Question[];
  keyPoints?: string[];
}): Block | null {
  const { title, subjectSlug, questions, keyPoints } = opts;

  if (subjectSlug === "maths") return arenaForTitle(title);

  const useFlashcards = hashStr(title) % 2 === 0;

  if (useFlashcards && questions.length >= 2) {
    return fc(
      ...questions
        .slice(0, 6)
        .map((q) => [q.q, q.answer] as [string, string]),
    );
  }

  if (questions.length >= 1) {
    const q = questions[questions.length - 1];
    return mcq(q.q, ensureFour(q.options, q.answer), q.answer, q.explain);
  }

  if (questions.length >= 2) {
    return fc(...questions.slice(0, 6).map((q) => [q.q, q.answer] as [string, string]));
  }

  if (keyPoints && keyPoints.length >= 2) {
    return fc(
      ...keyPoints.slice(0, 6).map((k, i) => [`Key idea ${i + 1}`, k] as [string, string]),
    );
  }

  return null;
}
