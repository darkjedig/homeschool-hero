/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as courses from "../courses.js";
import type * as dashboard from "../dashboard.js";
import type * as export_ from "../export.js";
import type * as exportData from "../exportData.js";
import type * as hello from "../hello.js";
import type * as http from "../http.js";
import type * as lessons from "../lessons.js";
import type * as points from "../points.js";
import type * as quizzes from "../quizzes.js";
import type * as rewards from "../rewards.js";
import type * as seed from "../seed.js";
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
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  courses: typeof courses;
  dashboard: typeof dashboard;
  export: typeof export_;
  exportData: typeof exportData;
  hello: typeof hello;
  http: typeof http;
  lessons: typeof lessons;
  points: typeof points;
  quizzes: typeof quizzes;
  rewards: typeof rewards;
  seed: typeof seed;
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
