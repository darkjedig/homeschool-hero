import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Weekly Friday Challenge generation.
 * Runs Monday 00:05, building the doc for the current (Mon–Sun) week so it's
 * ready by Friday. Per Convex guidelines we use crons.cron (not the daily
 * helper) with an explicit cron expression: "5 0 * * 1" = 00:05 every Monday.
 */
const crons = cronJobs();

crons.cron(
  "generate friday challenge",
  "5 0 * * 1",
  internal.fridayQuiz.generateForWeek,
  {},
);

export default crons;
