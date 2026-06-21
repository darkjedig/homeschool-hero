/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adaptive from "../adaptive.js";
import type * as aiCourseBuilder from "../aiCourseBuilder.js";
import type * as aiDrafts from "../aiDrafts.js";
import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as badges from "../badges.js";
import type * as calendar from "../calendar.js";
import type * as courses from "../courses.js";
import type * as crons from "../crons.js";
import type * as curriculum_aics from "../curriculum/aics.js";
import type * as curriculum_building from "../curriculum/building.js";
import type * as curriculum_english from "../curriculum/english.js";
import type * as curriculum_gamedev from "../curriculum/gamedev.js";
import type * as curriculum_history from "../curriculum/history.js";
import type * as curriculum_homemaking from "../curriculum/homemaking.js";
import type * as curriculum_maths from "../curriculum/maths.js";
import type * as curriculum_science from "../curriculum/science.js";
import type * as curriculum_types from "../curriculum/types.js";
import type * as dashboard from "../dashboard.js";
import type * as export_ from "../export.js";
import type * as exportData from "../exportData.js";
import type * as fridayQuiz from "../fridayQuiz.js";
import type * as hello from "../hello.js";
import type * as http from "../http.js";
import type * as lessons from "../lessons.js";
import type * as points from "../points.js";
import type * as quizzes from "../quizzes.js";
import type * as rewards from "../rewards.js";
import type * as seed from "../seed.js";
import type * as seedLessons from "../seedLessons.js";
import type * as seedRichCurriculum from "../seedRichCurriculum.js";
import type * as settings from "../settings.js";
import type * as subjects from "../subjects.js";
import type * as topics from "../topics.js";
import type * as userProfiles from "../userProfiles.js";
import type * as videoProgress from "../videoProgress.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adaptive: typeof adaptive;
  aiCourseBuilder: typeof aiCourseBuilder;
  aiDrafts: typeof aiDrafts;
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  badges: typeof badges;
  calendar: typeof calendar;
  courses: typeof courses;
  crons: typeof crons;
  "curriculum/aics": typeof curriculum_aics;
  "curriculum/building": typeof curriculum_building;
  "curriculum/english": typeof curriculum_english;
  "curriculum/gamedev": typeof curriculum_gamedev;
  "curriculum/history": typeof curriculum_history;
  "curriculum/homemaking": typeof curriculum_homemaking;
  "curriculum/maths": typeof curriculum_maths;
  "curriculum/science": typeof curriculum_science;
  "curriculum/types": typeof curriculum_types;
  dashboard: typeof dashboard;
  export: typeof export_;
  exportData: typeof exportData;
  fridayQuiz: typeof fridayQuiz;
  hello: typeof hello;
  http: typeof http;
  lessons: typeof lessons;
  points: typeof points;
  quizzes: typeof quizzes;
  rewards: typeof rewards;
  seed: typeof seed;
  seedLessons: typeof seedLessons;
  seedRichCurriculum: typeof seedRichCurriculum;
  settings: typeof settings;
  subjects: typeof subjects;
  topics: typeof topics;
  userProfiles: typeof userProfiles;
  videoProgress: typeof videoProgress;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
