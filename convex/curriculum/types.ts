// Shared types + compact builders for the rich curriculum modules.
// Importing this from other convex/curriculum/*.ts modules is fine — it has no
// Convex server runtime imports (pure data shapes).

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type InteractiveVariant =
  | "reveal"
  | "flashcards"
  | "ordering"
  | "timeline"
  | "codeSandbox"
  | "mathArena"
  | "match"
  | "fillBlank"
  | "simulation";

export type Block =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "example"; text: string }
  | { type: "keyPoints"; items: string[] }
  | {
      type: "interactive";
      variant: InteractiveVariant;
      data: { key: string; value: string }[];
    };

export type Question = {
  q: string;
  options: string[]; // exactly 4, answer must equal one option verbatim
  answer: string;
  explain: string;
};

export type RichLesson = {
  topic: string; // must match an existing topic name in the DB
  title: string;
  difficulty: Difficulty;
  minutes: number;
  points: number;
  summary: string; // 1–2 sentences → description + opening text
  blocks: Block[]; // heading + text + example + keyPoints + interactive
  questions: Question[]; // 5 MCQs
  kind?: "lesson" | "activity"; // "activity" → interactive game/lab lesson
};

export type TopicSpec = {
  name: string;
  description: string;
  difficulty: Difficulty;
};

export type SubjectCurriculum = {
  slug: string;
  // New topics to ensure exist before seeding lessons (appended after any
  // existing topics, preserving prior order). Topics referenced by a lesson but
  // missing here are auto-created with a generic description as a fallback.
  topics?: TopicSpec[];
  lessons: RichLesson[];
};

// ---- Compact interactive builders ----------------------------------------

/** Reveal/MCQ quick-check interactive. */
export function mcq(
  question: string,
  options: [string, string, string, string],
  answer: string,
  explanation: string,
): Block {
  return {
    type: "interactive",
    variant: "reveal",
    data: [
      { key: "question", value: question },
      { key: "option_0", value: options[0] },
      { key: "option_1", value: options[1] },
      { key: "option_2", value: options[2] },
      { key: "option_3", value: options[3] },
      { key: "answer", value: answer },
      { key: "explanation", value: explanation },
    ],
  };
}

/** Flashcards: each [front, back] pair becomes a card. */
export function fc(...pairs: [string, string][]): Block {
  return {
    type: "interactive",
    variant: "flashcards",
    data: pairs.map(([key, value]) => ({ key, value })),
  };
}

/** Drag-to-order: list in CORRECT order; key = position (1..n). */
export function ord(items: string[]): Block {
  return {
    type: "interactive",
    variant: "ordering",
    data: items.map((value, i) => ({ key: String(i + 1), value })),
  };
}

/** Timeline: list of [date/era, event]; rendered sorted by key. */
export function tl(...events: [string, string][]): Block {
  return {
    type: "interactive",
    variant: "timeline",
    data: events.map(([key, value]) => ({ key, value })),
  };
}

/**
 * Runnable code lab. The student edits `starter` and clicks Run; output renders
 * in a sandboxed iframe (JS console + HTML preview). All config is encoded as
 * {key,value} pairs so the schema only needs the new variant literal.
 */
export function code(cfg: {
  language: "javascript" | "html";
  starter: string;
  instructions: string;
  challenge?: string;
  expected?: string; // substring that should appear in console output
}): Block {
  const data: { key: string; value: string }[] = [
    { key: "language", value: cfg.language },
    { key: "starter", value: cfg.starter },
    { key: "instructions", value: cfg.instructions },
  ];
  if (cfg.challenge) data.push({ key: "challenge", value: cfg.challenge });
  if (cfg.expected) data.push({ key: "expected", value: cfg.expected });
  return { type: "interactive", variant: "codeSandbox", data };
}

/** Generative maths practice arena (infinite questions, scoring, optional timer). */
export function arena(cfg: {
  title: string;
  mode: "add" | "sub" | "mul" | "div" | "mixed" | "fractions" | "percent";
  min: number;
  max: number;
  count: number;
  seconds?: number;
}): Block {
  const data: { key: string; value: string }[] = [
    { key: "title", value: cfg.title },
    { key: "mode", value: cfg.mode },
    { key: "min", value: String(cfg.min) },
    { key: "max", value: String(cfg.max) },
    { key: "count", value: String(cfg.count) },
  ];
  if (cfg.seconds) data.push({ key: "seconds", value: String(cfg.seconds) });
  return { type: "interactive", variant: "mathArena", data };
}

/** Match game: each [term, definition] pair → a card to match. */
export function match(...pairs: [string, string][]): Block {
  return {
    type: "interactive",
    variant: "match",
    data: pairs.map(([key, value]) => ({ key, value })),
  };
}

/**
 * Fill-in-the-blank (cloze). Each [sentence, answer] uses "___" in the sentence
 * to mark the blank; answers seed a shuffled word bank.
 */
export function cloze(...items: [string, string][]): Block {
  return {
    type: "interactive",
    variant: "fillBlank",
    data: items.map(([key, value]) => ({ key, value })),
  };
}

/** Interactive science simulation, selected by id. */
export function sim(
  simId:
    | "circuit"
    | "particles"
    | "heart"
    | "lungs"
    | "skeleton"
    | "digestive"
    | "brain",
  title?: string,
): Block {
  const data: { key: string; value: string }[] = [{ key: "sim", value: simId }];
  if (title) data.push({ key: "title", value: title });
  return { type: "interactive", variant: "simulation", data };
}
