import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * HomeschoolHero schema.
 *
 * Auth accounts live in `authTables` (from @convex-dev/auth). Application
 * role/profile data lives in `userProfiles` (keyed by the auth user id).
 * All ownership is derived server-side via getAuthUserId(ctx) — never from
 * client-supplied args.
 *
 * System fields `_id` and `_creationTime` are added automatically.
 */
export default defineSchema({
  ...authTables,

  // Application profile + role, keyed by the auth user id.
  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("parent"), v.literal("student")),
    displayName: v.string(),
    avatarId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  subjects: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_order", ["active", "order"]),

  topics: defineTable({
    subjectId: v.id("subjects"),
    name: v.string(),
    description: v.string(),
    order: v.number(),
    difficultyLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
  })
    .index("by_subject", ["subjectId"])
    .index("by_subject_and_order", ["subjectId", "order"]),

  lessons: defineTable({
    subjectId: v.id("subjects"),
    topicId: v.id("topics"),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    lessonNotes: v.string(),
    videoUrl: v.string(),
    videoProvider: v.literal("youtube"),
    difficultyLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    estimatedMinutes: v.number(),
    pointsAwarded: v.number(),
    status: v.union(v.literal("draft"), v.literal("published")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_topic", ["topicId"])
    .index("by_subject", ["subjectId"])
    .index("by_status", ["status"])
    .index("by_slug", ["slug"])
    .searchIndex("search_title", { searchField: "title" }),

  quizzes: defineTable({
    lessonId: v.id("lessons"),
    subjectId: v.id("subjects"),
    topicId: v.id("topics"),
    title: v.string(),
    type: v.union(v.literal("lesson"), v.literal("friday")),
    difficultyLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    pointsAwarded: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_subject", ["subjectId"])
    .index("by_type", ["type"]),

  quizQuestions: defineTable({
    quizId: v.id("quizzes"),
    questionText: v.string(),
    questionType: v.union(
      v.literal("mcq"),
      v.literal("truefalse"),
      v.literal("ordering"),
    ),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.string(),
    difficultyLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    order: v.number(),
  }).index("by_quiz_and_order", ["quizId", "order"]),

  quizAttempts: defineTable({
    userId: v.id("users"),
    quizId: v.optional(v.id("quizzes")),
    fridayQuizId: v.optional(v.id("fridayQuizzes")),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    percentage: v.number(),
    pointsEarned: v.number(),
    completedAt: v.number(),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        selectedAnswer: v.string(),
        correct: v.boolean(),
      }),
    ),
  })
    .index("by_user", ["userId"])
    .index("by_quiz", ["quizId"])
    .index("by_friday_quiz", ["fridayQuizId"])
    .index("by_user_and_quiz", ["userId", "quizId"]),

  fridayQuizzes: defineTable({
    weekStartDate: v.string(),
    weekEndDate: v.string(),
    title: v.string(),
    questionIds: v.array(v.id("quizQuestions")),
    subjectsIncluded: v.array(v.id("subjects")),
    doublePoints: v.boolean(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("active"),
      v.literal("completed"),
    ),
  })
    .index("by_week", ["weekStartDate"])
    .index("by_status", ["status"]),

  videoProgress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    videoUrl: v.string(),
    secondsWatched: v.number(),
    lastTimestamp: v.number(),
    percentageWatched: v.number(),
    completed: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_lesson", ["lessonId"])
    .index("by_user_and_lesson", ["userId", "lessonId"]),

  pointsLedger: defineTable({
    userId: v.id("users"),
    sourceType: v.string(),
    sourceId: v.optional(v.string()),
    points: v.number(),
    description: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_source", ["userId", "sourceType"]),

  rewards: defineTable({
    title: v.string(),
    description: v.string(),
    pointsCost: v.number(),
    rewardType: v.string(),
    active: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_active", ["active"])
    .index("by_cost", ["pointsCost"]),

  rewardRedemptions: defineTable({
    userId: v.id("users"),
    rewardId: v.id("rewards"),
    pointsSpent: v.number(),
    status: v.union(
      v.literal("requested"),
      v.literal("approved"),
      v.literal("redeemed"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_reward", ["rewardId"])
    .index("by_status", ["status"]),

  badges: defineTable({
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    criteria: v.string(),
    pointsBonus: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_active", ["active"]),

  studentBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.id("badges"),
    awardedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_badge", ["badgeId"])
    .index("by_user_and_badge", ["userId", "badgeId"]),

  aiLessonDrafts: defineTable({
    requestedBy: v.id("users"),
    prompt: v.string(),
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
    proposedTitle: v.string(),
    proposedNotes: v.string(),
    proposedVideoUrl: v.string(),
    proposedQuizQuestions: v.array(
      v.object({
        questionText: v.string(),
        questionType: v.union(
          v.literal("mcq"),
          v.literal("truefalse"),
          v.literal("ordering"),
        ),
        options: v.array(v.string()),
        correctAnswer: v.string(),
        explanation: v.string(),
      }),
    ),
    difficultyLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"]),

  aiCourseDrafts: defineTable({
    requestedBy: v.id("users"),
    prompt: v.string(),
    model: v.string(),
    proposedSubject: v.object({
      name: v.string(),
      description: v.string(),
      icon: v.string(),
      color: v.string(),
    }),
    proposedTopics: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        difficultyLevel: v.union(
          v.literal("beginner"),
          v.literal("intermediate"),
          v.literal("advanced"),
        ),
      }),
    ),
    proposedLessons: v.array(
      v.object({
        topicIndex: v.number(),
        title: v.string(),
        notes: v.string(),
        videoUrl: v.string(),
        difficultyLevel: v.union(
          v.literal("beginner"),
          v.literal("intermediate"),
          v.literal("advanced"),
        ),
        pointsAwarded: v.number(),
        quizQuestions: v.array(
          v.object({
            questionText: v.string(),
            questionType: v.union(
              v.literal("mcq"),
              v.literal("truefalse"),
              v.literal("ordering"),
            ),
            options: v.array(v.string()),
            correctAnswer: v.string(),
            explanation: v.string(),
          }),
        ),
      }),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"]),

  // Single parent-scoped settings doc. openRouterKey is write-only from the
  // client's perspective (queries return keyIsSet only); the raw key is read
  // exclusively inside Convex actions via an internal query.
  settings: defineTable({
    openRouterModel: v.string(),
    openRouterKey: v.optional(v.string()),
    youtubeSearchEnabled: v.boolean(),
    updatedAt: v.number(),
  }),
});
