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

/* ---------------------- Electricity activities ---------------------- */

/** Rich interactive activities to drop into the 5 Electricity lessons (inserted
 *  after keyPoints, keeping the existing final quick-check). Mirrors the body-sim
 *  attach pattern. Idempotent per variant. */
const ELECTRICITY_ACTIVITIES: { title: string; block: ContentBlock }[] = [
  {
    title: "What Is Electricity?",
    block: {
      type: "interactive",
      variant: "match",
      data: [
        { key: "Current", value: "Flow of electrons (amps)" },
        { key: "Voltage", value: "The electrical push (volts)" },
        { key: "Resistance", value: "Opposes the flow (ohms)" },
        { key: "Electron", value: "Tiny particle that moves" },
        { key: "Watt", value: "Unit of electrical power" },
      ],
    },
  },
  {
    title: "Simple Circuits",
    block: {
      type: "interactive",
      variant: "simulation",
      data: [
        { key: "sim", value: "circuit" },
        { key: "title", value: "Build a Circuit" },
      ],
    },
  },
  {
    title: "Conductors & Insulators",
    block: {
      type: "interactive",
      variant: "match",
      data: [
        { key: "Copper wire core", value: "Conducts the current" },
        { key: "Plastic wire coat", value: "Insulates to keep us safe" },
        { key: "Metal plug pins", value: "Conduct into the socket" },
        { key: "Rubber plug case", value: "Insulates your hand" },
        { key: "Brass lamp holder", value: "Conducts inside the lamp" },
      ],
    },
  },
  {
    title: "Switches & Circuit Diagrams",
    block: {
      type: "interactive",
      variant: "match",
      data: [
        { key: "Long/short lines", value: "Battery" },
        { key: "Circle with an X", value: "Bulb" },
        { key: "Straight line", value: "Wire" },
        { key: "A break in the line", value: "Open switch" },
        { key: "Lines joined in a loop", value: "Complete circuit" },
      ],
    },
  },
  {
    title: "Electrical Safety",
    block: {
      type: "interactive",
      variant: "fillBlank",
      data: [
        { key: "Never poke anything into a ___.", value: "socket" },
        { key: "Keep electrical devices away from ___.", value: "water" },
        { key: "A frayed ___ must not be used.", value: "cable" },
        { key: "If something smokes, switch it ___ and unplug.", value: "off" },
        { key: "Never touch switches with ___ hands.", value: "wet" },
      ],
    },
  },
];

/**
 * Insert rich activities (match / circuit sim / cloze) into the Electricity
 * lessons. Idempotent — skips a lesson whose content already has a block of
 * the new variant.
 *
 *   npx convex run enrichLessons:attachElectricityActivities
 */
export const attachElectricityActivities = mutation({
  args: {},
  handler: async (ctx, _args) => {
    void _args;
    let patched = 0;
    let skipped = 0;

    const allLessons = await ctx.db.query("lessons").take(500);
    const byTitle = new Map(allLessons.map((l) => [l.title, l]));

    for (const spec of ELECTRICITY_ACTIVITIES) {
      const lesson = byTitle.get(spec.title);
      if (!lesson) {
        skipped += 1;
        continue;
      }
      const content: ContentBlock[] = [...(lesson.content ?? [])];
      const already = content.some(
        (b) => b.type === "interactive" && b.variant === spec.block.variant,
      );
      if (already) {
        skipped += 1;
        continue;
      }
      const kpIdx = content.findIndex((b) => b.type === "keyPoints");
      const insertAt = kpIdx >= 0 ? kpIdx + 1 : content.length;
      content.splice(insertAt, 0, spec.block);
      await ctx.db.patch(lesson._id, { content, updatedAt: Date.now() });
      patched += 1;
    }

    return { patched, skipped, total: ELECTRICITY_ACTIVITIES.length };
  },
});

/* ----------------- Duplicate-lesson replacement ----------------- */

type ReplacementSpec = {
  findTitle: string;
  newTitle: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  blocks: ContentBlock[];
  questions: { q: string; options: string[]; answer: string; explain: string }[];
};

const REPLACEMENTS: ReplacementSpec[] = [
  {
    findTitle: "How the Heart Pumps Blood",
    newTitle: "Blood Vessels: Arteries, Veins & Capillaries",
    summary:
      "Blood travels through three kinds of vessels: arteries carry it away from the heart, veins return it, and capillaries swap gases and nutrients.",
    difficulty: "intermediate",
    points: 80,
    blocks: [
      { type: "heading", text: "The Body's Pipework" },
      {
        type: "text",
        text: "Blood flows through three types of vessel. ARTERIES carry blood AWAY from the heart. They have thick, stretchy walls to handle the strong pump. VEINS carry blood BACK to the heart; they have valves that act like one-way doors so blood doesn't flow backwards.\n\nCAPILLARIES are tiny, thin vessels — so narrow that blood cells pass through in single file. This is where the real swap happens: oxygen and food pass out to your cells, and waste (like CO₂) passes back into the blood.",
      },
      {
        type: "example",
        text: "Your wrist pulse is blood surging through an artery each time the heart beats. Veins closer to the skin often look blue-ish. Capillaries are far too small to see.",
      },
      {
        type: "keyPoints",
        items: [
          "Arteries carry blood AWAY from the heart.",
          "Veins carry blood BACK to the heart (with valves).",
          "Capillaries are tiny — where gas + nutrient swaps happen.",
          "Arteries have thick walls; capillaries have thin ones.",
        ],
      },
      {
        type: "interactive",
        variant: "match",
        data: [
          { key: "Artery", value: "Carries blood away from the heart" },
          { key: "Vein", value: "Carries blood back to the heart" },
          { key: "Capillary", value: "Tiny vessel where swaps happen" },
          { key: "Valves", value: "One-way doors in veins" },
          { key: "Thick stretchy walls", value: "Feature of arteries" },
        ],
      },
    ],
    questions: [
      { q: "Which vessels carry blood AWAY from the heart?", options: ["Arteries", "Veins", "Capillaries", "Nerves"], answer: "Arteries", explain: "Arteries carry blood away from the heart." },
      { q: "Veins carry blood…", options: ["back to the heart", "away from the heart", "only in the brain", "nowhere"], answer: "back to the heart", explain: "Veins return blood to the heart." },
      { q: "Where does the gas and nutrient swap happen?", options: ["Capillaries", "Arteries", "Veins", "Bones"], answer: "Capillaries", explain: "Capillary walls are thin enough to swap." },
      { q: "Veins have ___ to stop blood flowing backwards.", options: ["valves", "pumps", "muscles", "teeth"], answer: "valves", explain: "One-way doors." },
      { q: "Arteries need thick walls because…", options: ["they handle the heart's strong pump", "they carry no blood", "they are tiny", "they are cold"], answer: "they handle the heart's strong pump", explain: "Strong pressure needs strong walls." },
    ],
  },
  {
    findTitle: "Building a Simple Circuit",
    newTitle: "Series & Parallel Circuits",
    summary:
      "In a series circuit components share one path; in a parallel circuit each has its own path — so one broken bulb only kills that branch.",
    difficulty: "intermediate",
    points: 90,
    blocks: [
      { type: "heading", text: "One Path or Many?" },
      {
        type: "text",
        text: "Components in a circuit can be wired two main ways. In a SERIES circuit, everything sits on a single loop — one after another. If one component breaks or is removed, the loop is broken and EVERYTHING stops. Fairy lights wired in series all go out when one bulb goes.\n\nIn a PARALLEL circuit, each component has its own separate path to the power source. If one breaks, the others keep working because current can still flow through the other paths. That is why the lights in your house are wired in parallel — one bulb dying doesn't plunge the whole room into darkness.",
      },
      {
        type: "example",
        text: "Series: a single loop with three bulbs — remove one, all three go out. Parallel: each bulb has its own loop — remove one, the other two stay lit.",
      },
      {
        type: "keyPoints",
        items: [
          "Series = one path; one break stops everything.",
          "Parallel = multiple paths; one break leaves others on.",
          "Homes are wired in parallel.",
          "Series is simpler; parallel is more reliable.",
        ],
      },
      {
        type: "interactive",
        variant: "simulation",
        data: [
          { key: "sim", value: "seriesParallel" },
          { key: "title", value: "Series vs Parallel" },
        ],
      },
    ],
    questions: [
      { q: "In a series circuit, if one bulb breaks…", options: ["all bulbs go out", "the others get brighter", "nothing changes", "the battery charges"], answer: "all bulbs go out", explain: "One path — one break stops everything." },
      { q: "In a parallel circuit, if one bulb breaks…", options: ["the others stay on", "all go out", "the battery dies", "they all get dim"], answer: "the others stay on", explain: "Other paths still carry current." },
      { q: "House lights are wired in…", options: ["parallel", "series", "a coil", "random"], answer: "parallel", explain: "So one dead bulb doesn't kill all lights." },
      { q: "Series circuits have how many paths?", options: ["One", "Two", "Many", "Zero"], answer: "One", explain: "A single loop." },
      { q: "Why are parallel circuits more reliable?", options: ["One break doesn't stop everything", "They use less wire", "They need no battery", "They are always series"], answer: "One break doesn't stop everything", explain: "Each branch is independent." },
    ],
  },
  {
    findTitle: "Solids, Liquids and Gases",
    newTitle: "Density: Why Things Float or Sink",
    summary:
      "Density is how tightly packed a substance's particles are. Objects less dense than water float; denser ones sink.",
    difficulty: "intermediate",
    points: 80,
    blocks: [
      { type: "heading", text: "Tightly Packed or Spread Out?" },
      {
        type: "text",
        text: "Density describes how tightly packed the matter in something is. We work it out as mass (how heavy) for a certain amount of space (volume). A block of steel and a block of cork the same size have the same volume — but steel is far heavier, so it is more dense.\n\nAn object floats in a liquid if it is LESS dense than the liquid, and sinks if it is MORE dense. Wood floats on water because it is less dense. A coin sinks because metal is denser than water. Ice is unusual: it is slightly less dense than liquid water, which is why ice cubes float.",
      },
      {
        type: "example",
        text: "A heavy metal coin sinks (dense), but a huge steel-hulled ship floats because it's full of air, making its OVERALL density lower than water. Shape + trapped air matter!",
      },
      {
        type: "keyPoints",
        items: [
          "Density = how tightly packed matter is.",
          "Less dense than the liquid → floats.",
          "More dense than the liquid → sinks.",
          "Ice floats because it's less dense than water.",
        ],
      },
      {
        type: "interactive",
        variant: "match",
        data: [
          { key: "Less dense than water", value: "Floats" },
          { key: "More dense than water", value: "Sinks" },
          { key: "Ice vs liquid water", value: "Ice is less dense" },
          { key: "Steel coin in water", value: "Sinks" },
          { key: "Cork in water", value: "Floats" },
        ],
      },
    ],
    questions: [
      { q: "An object floats if it is…", options: ["less dense than the liquid", "more dense than the liquid", "heavier than the liquid", "the same colour"], answer: "less dense than the liquid", explain: "Lower density → floats." },
      { q: "Ice floats in water because…", options: ["it is less dense than liquid water", "it is heavier", "it is warmer", "it is solid"], answer: "it is less dense than liquid water", explain: "Unusual — most solids are denser than their liquid." },
      { q: "A metal coin sinks because…", options: ["metal is denser than water", "it is round", "it is cold", "water is magnetic"], answer: "metal is denser than water", explain: "Higher density → sinks." },
      { q: "Density describes…", options: ["how tightly packed matter is", "the colour of a thing", "the temperature", "the shape"], answer: "how tightly packed matter is", explain: "Mass for a given volume." },
      { q: "A steel ship floats because…", options: ["its overall density is low (full of air)", "steel is less dense than water", "it has no mass", "water pushes it down"], answer: "its overall density is low (full of air)", explain: "Trapped air lowers overall density." },
    ],
  },
  {
    findTitle: "Push, Pull and Friction",
    newTitle: "Measuring Forces",
    summary:
      "Forces are measured in newtons (N) with a force meter. More force gives a bigger reading — and weight is a force too.",
    difficulty: "intermediate",
    points: 80,
    blocks: [
      { type: "heading", text: "How Big Is That Push?" },
      {
        type: "text",
        text: "Because a force is a push or a pull, we can measure how big it is. The unit of force is the newton (N), named after Sir Isaac Newton. One newton is about the force needed to lift a small apple.\n\nWe measure force with a force meter (also called a newton meter or spring scale). Inside, a spring stretches more when you pull harder — a pointer shows the reading in newtons. The harder you pull, the bigger the number.\n\nWeight is a force — the pull of gravity on an object's mass. So your weight is measured in newtons, not kilograms (kilograms measure mass — how much 'stuff' there is).",
      },
      {
        type: "example",
        text: "Hang a 100 g mass on a force meter and it reads about 1 N (gravity pulling on the mass). Pull a drawer hard and the spring stretches further → bigger newton reading.",
      },
      {
        type: "keyPoints",
        items: [
          "Force is measured in newtons (N).",
          "Tool: a force meter (newton meter / spring scale).",
          "More pull → spring stretches more → bigger reading.",
          "Weight is a force (newtons); mass is 'stuff' (kilograms).",
        ],
      },
      {
        type: "interactive",
        variant: "match",
        data: [
          { key: "Unit of force", value: "Newton (N)" },
          { key: "Measures force", value: "Force meter (newton meter)" },
          { key: "Weight", value: "A force, measured in newtons" },
          { key: "Mass", value: "How much 'stuff' (kilograms)" },
          { key: "1 newton is about", value: "The force to lift a small apple" },
        ],
      },
    ],
    questions: [
      { q: "Force is measured in…", options: ["newtons (N)", "kilograms", "litres", "metres"], answer: "newtons (N)", explain: "Named after Isaac Newton." },
      { q: "Which tool measures force?", options: ["Force meter (newton meter)", "Ruler", "Thermometer", "Clock"], answer: "Force meter (newton meter)", explain: "A spring scale." },
      { q: "Weight is a…", options: ["force, measured in newtons", "mass, measured in kg", "temperature", "colour"], answer: "force, measured in newtons", explain: "Gravity pulling on mass." },
      { q: "Mass is measured in…", options: ["kilograms", "newtons", "litres", "degrees"], answer: "kilograms", explain: "How much 'stuff'." },
      { q: "On a force meter, a harder pull makes the reading…", options: ["bigger", "smaller", "zero", "cold"], answer: "bigger", explain: "Spring stretches more." },
    ],
  },
];

/**
 * Replace the old text-only duplicate lessons (from the original seedLessons)
 * with brand-new UNIQUE lessons on a different angle, each with rich content
 * blocks + an interactive + a fresh 5-question quiz. Patches each lesson row
 * IN PLACE (keeps its _id + topicId, so calendar references stay valid) and
 * rebuilds its quiz. Idempotent — skips any title that's already gone.
 *
 * Rule: when two lessons cover the same ground, the one WITHOUT an interactive
 * is the one changed into something new.
 *
 *   npx convex run enrichLessons:replaceDuplicateLessons
 */
export const replaceDuplicateLessons = mutation({
  args: {},
  handler: async (ctx, _args) => {
    void _args;
    let replaced = 0;
    let skipped = 0;

    const allLessons = await ctx.db.query("lessons").take(500);
    const byTitle = new Map(allLessons.map((l) => [l.title, l]));

    for (const spec of REPLACEMENTS) {
      const lesson = byTitle.get(spec.findTitle);
      if (!lesson) {
        skipped += 1; // already replaced / not present
        continue;
      }

      const now = Date.now();
      await ctx.db.patch(lesson._id, {
        title: spec.newTitle,
        description: spec.summary,
        lessonNotes: spec.summary,
        content: spec.blocks,
        difficultyLevel: spec.difficulty,
        pointsAwarded: spec.points,
        updatedAt: now,
      });

      // Rebuild the lesson quiz: reuse the quiz row, wipe old questions, insert new.
      const quiz = await ctx.db
        .query("quizzes")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
        .filter((q) => q.eq(q.field("type"), "lesson"))
        .unique();

      let quizId = quiz?._id;
      if (quizId) {
        const oldQs = await ctx.db
          .query("quizQuestions")
          .withIndex("by_quiz_and_order", (q) => q.eq("quizId", quizId!))
          .take(50);
        for (const oq of oldQs) await ctx.db.delete(oq._id);
      } else {
        quizId = await ctx.db.insert("quizzes", {
          lessonId: lesson._id,
          subjectId: lesson.subjectId,
          topicId: lesson.topicId,
          title: `${spec.newTitle} — Quiz`,
          type: "lesson",
          difficultyLevel: spec.difficulty,
          pointsAwarded: spec.points,
        });
      }

      for (let i = 0; i < spec.questions.length; i++) {
        const qq = spec.questions[i];
        await ctx.db.insert("quizQuestions", {
          quizId,
          questionText: qq.q,
          questionType: "mcq",
          options: qq.options,
          correctAnswer: qq.answer,
          explanation: qq.explain,
          difficultyLevel: spec.difficulty,
          order: i,
        });
      }

      // Update the existing quiz row's title/points to match the new lesson.
      if (quiz) {
        await ctx.db.patch(quiz._id, {
          title: `${spec.newTitle} — Quiz`,
          difficultyLevel: spec.difficulty,
          pointsAwarded: spec.points,
        });
      }

      replaced += 1;
    }

    return { replaced, skipped, total: REPLACEMENTS.length };
  },
});

/* --------------- Electricity: sims replace match/cloze games --------------- */

/** Each Electricity lesson → the unique simulation id that fits it best (no more
 *  pile of match games). The match/fillBlank blocks added earlier are removed
 *  and the right sim is dropped in after the key points. Idempotent. */
const ELECTRICITY_SIM_UPGRADES: { title: string; simId: string }[] = [
  { title: "What Is Electricity?", simId: "electronFlow" },
  { title: "Simple Circuits", simId: "circuit" },
  { title: "Conductors & Insulators", simId: "conductorTester" },
  { title: "Switches & Circuit Diagrams", simId: "switchLab" },
  { title: "Electrical Safety", simId: "hazardSpotter" },
  { title: "Series & Parallel Circuits", simId: "seriesParallel" },
];

const SIM_TITLES: Record<string, string> = {
  electronFlow: "Electron Flow",
  circuit: "Build a Circuit",
  conductorTester: "Conductor or Insulator?",
  switchLab: "Switch & Symbol Lab",
  hazardSpotter: "Spot the Hazards",
  seriesParallel: "Series vs Parallel",
};

/**
 * Replace the match/cloze activities in the Electricity lessons with unique,
 * lesson-specific simulations (electron flow, conductor tester, series/parallel,
 * switch lab, hazard spotter). Idempotent — a lesson already carrying its target
 * sim is left alone.
 *
 *   npx convex run enrichLessons:attachElectricitySims
 */
export const attachElectricitySims = mutation({
  args: {},
  handler: async (ctx, _args) => {
    void _args;
    let upgraded = 0;
    let skipped = 0;

    const allLessons = await ctx.db.query("lessons").take(500);
    const byTitle = new Map(allLessons.map((l) => [l.title, l]));

    for (const spec of ELECTRICITY_SIM_UPGRADES) {
      const lesson = byTitle.get(spec.title);
      if (!lesson) {
        skipped += 1;
        continue;
      }

      // Drop the match/fillBlank activity blocks (the things we're replacing).
      // Keep the original reveal/flashcards quick-check + any existing sim.
      let content: ContentBlock[] = (lesson.content ?? []).filter(
        (b) => !(b.type === "interactive" && (b.variant === "match" || b.variant === "fillBlank")),
      );

      const hasTarget = content.some(
        (b) =>
          b.type === "interactive" &&
          b.variant === "simulation" &&
          b.data?.some((d) => d.key === "sim" && d.value === spec.simId),
      );
      if (hasTarget) {
        skipped += 1;
        continue;
      }

      const simBlock: ContentBlock = {
        type: "interactive",
        variant: "simulation",
        data: [
          { key: "sim", value: spec.simId },
          { key: "title", value: SIM_TITLES[spec.simId] ?? "Interactive" },
        ],
      };

      const kpIdx = content.findIndex((b) => b.type === "keyPoints");
      const insertAt = kpIdx >= 0 ? kpIdx + 1 : content.length;
      content = [...content.slice(0, insertAt), simBlock, ...content.slice(insertAt)];

      await ctx.db.patch(lesson._id, { content, updatedAt: Date.now() });
      upgraded += 1;
    }

    return { upgraded, skipped, total: ELECTRICITY_SIM_UPGRADES.length };
  },
});
