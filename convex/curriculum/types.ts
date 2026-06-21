// Shared types + compact builders for the rich curriculum modules.
// Importing this from other convex/curriculum/*.ts modules is fine — it has no
// Convex server runtime imports (pure data shapes).

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Block =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "example"; text: string }
  | { type: "keyPoints"; items: string[] }
  | {
      type: "interactive";
      variant: "reveal" | "flashcards" | "ordering" | "timeline";
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
};

export type SubjectCurriculum = {
  slug: string;
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
