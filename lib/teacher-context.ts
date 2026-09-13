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

export function defaultSuggestions(page: string): string[] {
  if (page === "lesson") {
    return ["Help me with this lesson", "Explain this another way", "Give me a hint"];
  }
  if (page === "quiz" || page === "friday-quiz") {
    return ["Give me a hint", "What is this asking?", "How should I start?"];
  }
  if (page === "calendar") {
    return ["What lessons do I have tomorrow?", "What's on today?", "What should I do next?"];
  }
  return ["What am I learning today?", "How am I doing?", "What should I start with?"];
}
