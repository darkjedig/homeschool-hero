import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const COURSE_SCHEMA = `You are a curriculum designer for a homeschooled 11-12 year old.
Return ONLY valid JSON (no markdown, no commentary) with this exact shape:
{
  "subject": { "name": string, "description": string, "icon": string (a Lucide icon name like "FlaskConical"), "color": string (hex like "#22c55e") },
  "topics": [ { "name": string, "description": string, "difficultyLevel": "beginner"|"intermediate"|"advanced" } ],
  "lessons": [ { "topicIndex": number (0-based index into topics), "title": string, "notes": string (2-4 sentences a child can read), "videoUrl": string (a YouTube search URL, https://www.youtube.com/results?search_query=...), "difficultyLevel": "beginner"|"intermediate"|"advanced", "pointsAwarded": number (50-150), "quizQuestions": [ { "questionText": string, "questionType": "mcq", "options": [4 strings], "correctAnswer": string (must match one option exactly), "explanation": string } ] } ]
}
Rules: 3-5 topics; 1-2 lessons per topic; exactly 4 options per question; correctAnswer must be one of the options; age-appropriate, encouraging tone.`;

const LESSON_SCHEMA = `You are a curriculum designer for a homeschooled 11-12 year old.
Return ONLY valid JSON (no markdown, no commentary) with this exact shape:
{
  "title": string,
  "notes": string (3-6 sentences a child can read),
  "videoUrl": string (a YouTube search URL, https://www.youtube.com/results?search_query=...),
  "quizQuestions": [ { "questionText": string, "questionType": "mcq", "options": [4 strings], "correctAnswer": string (must match one option exactly), "explanation": string } ]
}
Rules: 4-6 quiz questions; exactly 4 options each; correctAnswer must be one of the options; age-appropriate, encouraging tone.`;

async function callOpenRouter(
  key: string,
  model: string,
  system: string,
  user: string,
): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Title": "HomeschoolHero",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from model");
  return content;
}

function parseJson<T>(raw: string): T {
  let s = raw.trim();
  // Strip markdown code fences if the model added them despite instructions.
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  }
  return JSON.parse(s) as T;
}

/** Generate a full course or a single lesson draft via OpenRouter (parent-only). */
export const generate = action({
  args: {
    type: v.union(v.literal("course"), v.literal("lesson")),
    draftId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const cfg = await ctx.runQuery(internal.settings.getAiConfigInternal, {});
    const model = cfg.model;

    if (!cfg.key) {
      const msg = "No OpenRouter API key set. Add one in Settings.";
      if (args.type === "course") {
        await ctx.runMutation(internal.aiDrafts.saveCourseResult, {
          draftId: args.draftId as never,
          model,
          ok: false,
          errorMessage: msg,
        });
      } else {
        await ctx.runMutation(internal.aiDrafts.saveLessonResult, {
          draftId: args.draftId as never,
          model,
          ok: false,
          errorMessage: msg,
        });
      }
      return;
    }

    try {
      if (args.type === "course") {
        const raw = await callOpenRouter(cfg.key, model, COURSE_SCHEMA, args.prompt);
        const parsed = parseJson<{
          subject: { name: string; description: string; icon: string; color: string };
          topics: { name: string; description: string; difficultyLevel: "beginner" | "intermediate" | "advanced" }[];
          lessons: {
            topicIndex: number;
            title: string;
            notes: string;
            videoUrl: string;
            difficultyLevel: "beginner" | "intermediate" | "advanced";
            pointsAwarded: number;
            quizQuestions: {
              questionText: string;
              questionType: "mcq" | "truefalse" | "ordering";
              options: string[];
              correctAnswer: string;
              explanation: string;
            }[];
          }[];
        }>(raw);
        await ctx.runMutation(internal.aiDrafts.saveCourseResult, {
          draftId: args.draftId as never,
          model,
          ok: true,
          subject: parsed.subject,
          topics: parsed.topics,
          lessons: parsed.lessons,
        });
      } else {
        const raw = await callOpenRouter(cfg.key, model, LESSON_SCHEMA, args.prompt);
        const parsed = parseJson<{
          title: string;
          notes: string;
          videoUrl: string;
          quizQuestions: {
            questionText: string;
            questionType: "mcq" | "truefalse" | "ordering";
            options: string[];
            correctAnswer: string;
            explanation: string;
          }[];
        }>(raw);
        await ctx.runMutation(internal.aiDrafts.saveLessonResult, {
          draftId: args.draftId as never,
          model,
          ok: true,
          title: parsed.title,
          notes: parsed.notes,
          videoUrl: parsed.videoUrl,
          quizQuestions: parsed.quizQuestions,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      if (args.type === "course") {
        await ctx.runMutation(internal.aiDrafts.saveCourseResult, {
          draftId: args.draftId as never,
          model,
          ok: false,
          errorMessage: msg,
        });
      } else {
        await ctx.runMutation(internal.aiDrafts.saveLessonResult, {
          draftId: args.draftId as never,
          model,
          ok: false,
          errorMessage: msg,
        });
      }
    }
  },
});

/** Parent-only: verify the saved key works with a trivial call. */
export const testConnection = action({
  args: {},
  handler: async (ctx): Promise<{ ok: boolean; message: string }> => {
    const cfg = await ctx.runQuery(internal.settings.getAiConfigInternal, {});
    if (!cfg.key) return { ok: false, message: "No API key set." };
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.key}`,
          "Content-Type": "application/json",
          "X-Title": "HomeschoolHero",
        },
        body: JSON.stringify({
          model: cfg.model,
          messages: [
            { role: "user", content: "Reply with the single word: ok" },
          ],
          max_tokens: 5,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        return { ok: false, message: `OpenRouter ${res.status}: ${t.slice(0, 150)}` };
      }
      return { ok: true, message: `Connected — model ${cfg.model} responded.` };
    } catch (e) {
      return {
        ok: false,
        message: e instanceof Error ? e.message : "Connection failed",
      };
    }
  },
});
