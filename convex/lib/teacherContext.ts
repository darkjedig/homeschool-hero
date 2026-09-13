import { EXCERPT_MAX_CHARS } from "./aiPresets";

export const appContextValidatorFields = {
  page: "string",
} as const;

export type TeacherAppContext = {
  page: string;
  subjectName?: string;
  lessonTitle?: string;
  lessonId?: string;
  section?: string;
  currentQuestionText?: string;
  currentQuestionOptions?: string[];
  currentQuestionIndex?: number;
  currentQuestionTotal?: number;
  videoPercent?: number;
  todayLessons?: { subjectName: string; title: string; completed: boolean }[];
  excerpt?: string;
  today?: string;
};

const FORBIDDEN = /correctAnswer|correct_answer|answerKey|answer_key/i;

export function sanitizeAppContext(input: TeacherAppContext | undefined): TeacherAppContext | null {
  if (!input || typeof input.page !== "string") return null;
  const page = input.page.trim().slice(0, 40);
  if (!page) return null;

  const out: TeacherAppContext = { page };

  if (typeof input.subjectName === "string") {
    out.subjectName = input.subjectName.trim().slice(0, 80);
  }
  if (typeof input.lessonTitle === "string") {
    out.lessonTitle = input.lessonTitle.trim().slice(0, 160);
  }
  if (typeof input.lessonId === "string") {
    out.lessonId = input.lessonId.trim().slice(0, 64);
  }
  if (typeof input.section === "string") {
    out.section = input.section.trim().slice(0, 80);
  }
  if (typeof input.currentQuestionText === "string") {
    out.currentQuestionText = input.currentQuestionText.trim().slice(0, 400);
  }
  if (Array.isArray(input.currentQuestionOptions)) {
    out.currentQuestionOptions = input.currentQuestionOptions
      .filter((o): o is string => typeof o === "string")
      .map((o) => o.trim().slice(0, 200))
      .slice(0, 6);
  }
  if (typeof input.currentQuestionIndex === "number" && Number.isFinite(input.currentQuestionIndex)) {
    out.currentQuestionIndex = Math.max(0, Math.floor(input.currentQuestionIndex));
  }
  if (typeof input.currentQuestionTotal === "number" && Number.isFinite(input.currentQuestionTotal)) {
    out.currentQuestionTotal = Math.max(0, Math.floor(input.currentQuestionTotal));
  }
  if (typeof input.videoPercent === "number" && Number.isFinite(input.videoPercent)) {
    out.videoPercent = Math.max(0, Math.min(100, Math.round(input.videoPercent)));
  }
  if (Array.isArray(input.todayLessons)) {
    out.todayLessons = input.todayLessons.slice(0, 8).map((row) => ({
      subjectName: String(row.subjectName ?? "").slice(0, 80),
      title: String(row.title ?? "").slice(0, 160),
      completed: !!row.completed,
    }));
  }
  if (typeof input.excerpt === "string") {
    const cleaned = input.excerpt.replace(FORBIDDEN, "").trim();
    out.excerpt = cleaned.slice(0, EXCERPT_MAX_CHARS);
  }
  if (typeof input.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.today.trim())) {
    out.today = input.today.trim();
  }

  return out;
}

export function formatAppContext(ctx: TeacherAppContext): string {
  const lines = [`Current page: ${ctx.page}`];
  if (ctx.today) lines.push(`Today's date: ${ctx.today}`);
  if (ctx.subjectName) lines.push(`Subject: ${ctx.subjectName}`);
  if (ctx.lessonTitle) lines.push(`Lesson: ${ctx.lessonTitle}`);
  if (ctx.section) lines.push(`Section: ${ctx.section}`);
  if (ctx.videoPercent !== undefined) lines.push(`Video watched: ${ctx.videoPercent}%`);
  if (ctx.currentQuestionText) {
    const n =
      ctx.currentQuestionIndex !== undefined && ctx.currentQuestionTotal
        ? ` (question ${ctx.currentQuestionIndex + 1} of ${ctx.currentQuestionTotal})`
        : "";
    lines.push(`Current question${n}: ${ctx.currentQuestionText}`);
    if (ctx.currentQuestionOptions?.length) {
      lines.push(`Options: ${ctx.currentQuestionOptions.join(" | ")}`);
    }
    lines.push("Do not reveal which option is correct.");
  }
  if (ctx.todayLessons?.length) {
    lines.push("Today's lessons already visible on this page:");
    for (const row of ctx.todayLessons) {
      lines.push(`- ${row.subjectName}: ${row.title}${row.completed ? " (done)" : ""}`);
    }
  }
  if (ctx.excerpt) {
    lines.push("Short lesson excerpt (not the full lesson):");
    lines.push(ctx.excerpt);
  }
  return lines.join("\n");
}
