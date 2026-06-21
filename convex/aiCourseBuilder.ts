import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Shared instructions for the rich `content` block array (used by lessons +
 *  courses). The model returns ONE content array that already includes the
 *  interactive block as its final element, so we can store it verbatim. */
const CONTENT_INSTRUCTIONS = `Each lesson must include a "content" array of structured teaching blocks, in this order:
1. {"type":"heading","text":"a short section heading"}
2. one or two {"type":"text","text":"2-4 sentence teaching paragraph a child can read"}
3. {"type":"example","text":"a worked example showing the idea in action"}
4. {"type":"keyPoints","items":["3-5 short bullet points"]}
5. EXACTLY ONE {"type":"interactive", ...} block as the LAST element.

The interactive block has a "variant" and a "data" array of {"key","value"} pairs. Pick the variant that best fits the topic:
- "reveal" (multiple-choice quick check): data = [{"key":"question","value":"..."},{"key":"option_0","value":"..."},{"key":"option_1","value":"..."},{"key":"option_2","value":"..."},{"key":"option_3","value":"..."},{"key":"answer","value":"MUST exactly match one of the option_N values"},{"key":"explanation","value":"why the answer is correct"}]
- "flashcards" (study cards): data = 3-5 pairs like [{"key":"front question","value":"back answer"}, ...]
- "ordering" (put in order): data = 4-6 pairs in CORRECT order like [{"key":"1","value":"first step"},{"key":"2","value":"second step"}, ...]
- "timeline" (events on a line): data = 3-5 pairs like [{"key":"1914","value":"event description"}, ...]
Prefer "reveal" unless the topic is naturally a sequence (ordering/timeline) or a definition recall set (flashcards).`;

const COURSE_SCHEMA = `You are a curriculum designer for a homeschooled 11-12 year old.
Return ONLY valid JSON (no markdown, no commentary) with this exact shape:
{
  "subject": { "name": string, "description": string, "icon": string (a Lucide icon name like "Globe", "FlaskConical", "Calculator"), "color": string (hex like "#22c55e") },
  "topics": [ { "name": string, "description": string, "difficultyLevel": "beginner"|"intermediate"|"advanced" } ],
  "lessons": [ { "topicIndex": number (0-based index into topics), "title": string, "notes": string (2-4 sentence summary), "content": [ ...rich blocks as described below... ], "videoUrl": string (a YouTube search URL, https://www.youtube.com/results?search_query=...), "difficultyLevel": "beginner"|"intermediate"|"advanced", "pointsAwarded": number (50-150), "quizQuestions": [ { "questionText": string, "questionType": "mcq", "options": [4 strings], "correctAnswer": string (must match one option exactly), "explanation": string } ] } ]
}
Rules: 3-5 topics; 1-2 lessons per topic; exactly 4 options per question; correctAnswer must be one of the options; age-appropriate, encouraging tone.

${CONTENT_INSTRUCTIONS}`;

const LESSON_SCHEMA = `You are a curriculum designer for a homeschooled 11-12 year old.
Return ONLY valid JSON (no markdown, no commentary) with this exact shape:
{
  "title": string,
  "content": [ ...rich blocks as described below... ],
  "videoUrl": string (a YouTube search URL, https://www.youtube.com/results?search_query=...),
  "quizQuestions": [ { "questionText": string, "questionType": "mcq", "options": [4 strings], "correctAnswer": string (must match one option exactly), "explanation": string } ]
}
Rules: 4-6 quiz questions; exactly 4 options each; correctAnswer must be one of the options; age-appropriate, encouraging tone.

${CONTENT_INSTRUCTIONS}`;

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

// ---- content-block helpers (mirror convex/schema.ts contentBlock shape) ----

type ContentBlockInput = {
  type: "heading" | "text" | "example" | "keyPoints" | "video" | "interactive";
  text?: string;
  items?: string[];
  url?: string;
  caption?: string;
  variant?: "reveal" | "flashcards" | "ordering" | "timeline";
  data?: { key: string; value: string }[];
};

const VALID_TYPES = new Set(["heading", "text", "example", "keyPoints", "video", "interactive"]);
const VALID_VARIANTS = new Set(["reveal", "flashcards", "ordering", "timeline"]);

/**
 * Defensive cleanup of model-generated content blocks. Drops anything that
 * doesn't match the schema so a single bad block can't fail the whole mutation.
 * Also guarantees interactive blocks carry a valid variant + data array.
 */
function sanitizeContent(blocks: ContentBlockInput[] | undefined): ContentBlockInput[] {
  if (!Array.isArray(blocks)) return [];
  const out: ContentBlockInput[] = [];
  for (const b of blocks) {
    if (!b || typeof b !== "object" || !VALID_TYPES.has(b.type)) continue;
    const clean: ContentBlockInput = { type: b.type as ContentBlockInput["type"] };
    if (typeof b.text === "string") clean.text = b.text;
    if (Array.isArray(b.items)) clean.items = b.items.filter((x) => typeof x === "string");
    if (typeof b.url === "string") clean.url = b.url;
    if (typeof b.caption === "string") clean.caption = b.caption;
    if (b.type === "interactive") {
      const variant = VALID_VARIANTS.has(b.variant as string) ? (b.variant as ContentBlockInput["variant"]) : "reveal";
      const data = Array.isArray(b.data)
        ? b.data
            .filter((d) => d && typeof d.key === "string" && typeof d.value === "string")
            .map((d) => ({ key: d.key, value: d.value }))
        : [];
      if (data.length === 0) continue; // an interactive with no data is useless
      clean.variant = variant;
      clean.data = data;
    }
    out.push(clean);
  }
  return out;
}

/** Build a plain-text lesson-notes fallback from the content blocks. */
function notesFromContent(blocks: ContentBlockInput[] | undefined, title: string): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return title;
  const parts: string[] = [];
  for (const b of blocks) {
    if ((b.type === "text" || b.type === "example") && typeof b.text === "string") {
      parts.push(b.text);
    } else if (b.type === "keyPoints" && Array.isArray(b.items)) {
      parts.push(b.items.map((i) => `• ${i}`).join("\n"));
    }
  }
  return parts.length > 0 ? parts.join("\n\n") : title;
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
            content?: ContentBlockInput[];
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
          lessons: parsed.lessons.map((l) => ({
            topicIndex: l.topicIndex,
            title: l.title,
            notes: l.notes,
            content: sanitizeContent(l.content),
            videoUrl: l.videoUrl,
            difficultyLevel: l.difficultyLevel,
            pointsAwarded: l.pointsAwarded,
            quizQuestions: l.quizQuestions,
          })),
        });
      } else {
        const raw = await callOpenRouter(cfg.key, model, LESSON_SCHEMA, args.prompt);
        const parsed = parseJson<{
          title: string;
          content?: ContentBlockInput[];
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
          // Derive a plain-text summary from the content paragraphs as the
          // lesson notes fallback (used by search + the lesson page when
          // blocks aren't rendered).
          notes: notesFromContent(parsed.content, parsed.title),
          content: sanitizeContent(parsed.content),
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
