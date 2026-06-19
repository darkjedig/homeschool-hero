import { mutation } from "./_generated/server";

/**
 * One-off bootstrap: seeds the 8 core subjects + their starter topics.
 * Idempotent — skips any subject whose slug already exists.
 * Run once via `npx convex run seed:seed`.
 *
 * Sample lessons are intentionally NOT seeded here because they require a
 * parent `createdBy` user; the parent creates/publishes lessons in Phase 4.
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let createdSubjects = 0;
    let createdTopics = 0;

    for (const subject of CURRICULUM) {
      const existing = await ctx.db
        .query("subjects")
        .withIndex("by_slug", (q) => q.eq("slug", subject.slug))
        .unique();
      if (existing !== null) continue;

      const subjectId = await ctx.db.insert("subjects", {
        name: subject.name,
        slug: subject.slug,
        description: subject.description,
        icon: subject.icon,
        color: subject.color,
        order: subject.order,
        active: true,
        createdAt: now,
        updatedAt: now,
      });
      createdSubjects += 1;

      let order = 0;
      for (const topic of subject.topics) {
        await ctx.db.insert("topics", {
          subjectId,
          name: topic.name,
          description: topic.description,
          order,
          difficultyLevel: topic.difficulty,
        });
        order += 1;
        createdTopics += 1;
      }
    }

    return { createdSubjects, createdTopics };
  },
});

type Topic = {
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
};

type Subject = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  topics: Topic[];
};

const CURRICULUM: Subject[] = [
  {
    name: "Maths",
    slug: "maths",
    description: "Numbers, problem solving, and logical thinking.",
    icon: "Calculator",
    color: "#3b82f6",
    order: 0,
    topics: [
      { name: "Fractions", description: "Parts of a whole, equivalence, operations.", difficulty: "beginner" },
      { name: "Ratios", description: "Comparing quantities and proportions.", difficulty: "beginner" },
      { name: "Basic Algebra", description: "Variables, expressions, simple equations.", difficulty: "intermediate" },
      { name: "Problem Solving", description: "Word problems and multi-step reasoning.", difficulty: "intermediate" },
    ],
  },
  {
    name: "English",
    slug: "english",
    description: "Reading, writing, grammar, and communication.",
    icon: "BookOpen",
    color: "#a855f7",
    order: 1,
    topics: [
      { name: "Grammar", description: "Parts of speech and sentence mechanics.", difficulty: "beginner" },
      { name: "Sentence Structure", description: "Building clear, varied sentences.", difficulty: "beginner" },
      { name: "Reading Comprehension", description: "Understanding and analysing texts.", difficulty: "intermediate" },
      { name: "Vocabulary", description: "Building a richer word bank.", difficulty: "beginner" },
      { name: "Writing", description: "Planning and crafting pieces of writing.", difficulty: "intermediate" },
    ],
  },
  {
    name: "Science",
    slug: "science",
    description: "How the natural and physical world works.",
    icon: "FlaskConical",
    color: "#22c55e",
    order: 2,
    topics: [
      { name: "Human Body", description: "Systems that keep us alive and healthy.", difficulty: "beginner" },
      { name: "Electricity", description: "Circuits, conductors, and safety.", difficulty: "intermediate" },
      { name: "States of Matter", description: "Solids, liquids, gases, and changes.", difficulty: "beginner" },
      { name: "Forces", description: "Push, pull, gravity, and friction.", difficulty: "intermediate" },
    ],
  },
  {
    name: "History",
    slug: "history",
    description: "People, events, and ideas that shaped the world.",
    icon: "Landmark",
    color: "#f97316",
    order: 3,
    topics: [
      { name: "World War I", description: "Causes, key events, and aftermath.", difficulty: "intermediate" },
      { name: "World War II", description: "Global conflict, home front, and legacy.", difficulty: "intermediate" },
      { name: "American Founding & Revolution", description: "Birth of the United States.", difficulty: "intermediate" },
      { name: "War of 1812", description: "Causes, events, and consequences.", difficulty: "advanced" },
      { name: "American Civil War", description: "Division, conflict, and reunification.", difficulty: "advanced" },
    ],
  },
  {
    name: "AI & Computer Science",
    slug: "ai-and-computer-science",
    description: "Computing foundations and using AI responsibly.",
    icon: "Cpu",
    color: "#06b6d4",
    order: 4,
    topics: [
      { name: "Prompts", description: "Writing effective AI prompts.", difficulty: "beginner" },
      { name: "Logic", description: "Reasoning and Boolean thinking.", difficulty: "beginner" },
      { name: "Logic Gates", description: "AND, OR, NOT and combining them.", difficulty: "intermediate" },
      { name: "Binary", description: "How computers represent data.", difficulty: "intermediate" },
      { name: "Problem-Solving", description: "Decomposition and computational thinking.", difficulty: "beginner" },
      { name: "Safe AI Use", description: "Limits, privacy, and responsible use.", difficulty: "beginner" },
    ],
  },
  {
    name: "Game Development",
    slug: "game-development",
    description: "Designing and coding playable games.",
    icon: "Gamepad2",
    color: "#ec4899",
    order: 5,
    topics: [
      { name: "Game Loops", description: "The heartbeat of every game.", difficulty: "beginner" },
      { name: "Coordinates", description: "Positioning objects in 2D space.", difficulty: "beginner" },
      { name: "Game Logic", description: "Rules, state, and decision-making.", difficulty: "intermediate" },
      { name: "Coding", description: "Turning ideas into runnable programs.", difficulty: "intermediate" },
      { name: "Character Movement", description: "Input, velocity, and animation.", difficulty: "intermediate" },
    ],
  },
  {
    name: "Homemaking",
    slug: "homemaking",
    description: "Practical life skills for the home.",
    icon: "ChefHat",
    color: "#f43f5e",
    order: 6,
    topics: [
      { name: "Cooking Basics", description: "Simple recipes and techniques.", difficulty: "beginner" },
      { name: "Kitchen Safety", description: "Staying safe while cooking.", difficulty: "beginner" },
      { name: "Recipes", description: "Following and adapting recipes.", difficulty: "beginner" },
      { name: "Cleaning Routines", description: "Keeping spaces tidy and hygienic.", difficulty: "beginner" },
      { name: "Appliance Safety", description: "Using home appliances correctly.", difficulty: "beginner" },
    ],
  },
  {
    name: "Building & Construction",
    slug: "building-and-construction",
    description: "Measuring, making, and building with confidence.",
    icon: "Hammer",
    color: "#d97706",
    order: 7,
    topics: [
      { name: "Blueprints", description: "Reading and understanding plans.", difficulty: "intermediate" },
      { name: "Scale", description: "Scaling drawings and measurements.", difficulty: "intermediate" },
      { name: "Measuring", description: "Accurate measurement techniques.", difficulty: "beginner" },
      { name: "Construction Basics", description: "Foundations, materials, and methods.", difficulty: "beginner" },
      { name: "Hand-Tool Mechanics", description: "Using hand tools safely and well.", difficulty: "beginner" },
    ],
  },
];
