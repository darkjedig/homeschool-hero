"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";

type DataBag = {
  subjects: { _id: string; name: string; slug: string; color: string; active: boolean }[];
  lessons: { _id: string; title: string; status: string; pointsAwarded: number; estimatedMinutes: number }[];
  attempts: { _id: string; quizId: string; correctAnswers: number; totalQuestions: number; percentage: number; pointsEarned: number }[];
  videoProgress: { _id: string; lessonId: string; percentageWatched: number; completed: boolean; secondsWatched: number }[];
  points: { _id: string; sourceType: string; points: number; description: string }[];
  redemptions: { _id: string; rewardId: string; pointsSpent: number; status: string }[];
};

function esc(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCSV(d: DataBag): string {
  const rows: string[][] = [
    ["section", "id", "field1", "field2", "field3", "field4"],
  ];
  for (const s of d.subjects)
    rows.push(["subject", s._id, s.name, s.slug, s.color, String(s.active)]);
  for (const l of d.lessons)
    rows.push(["lesson", l._id, l.title, l.status, `${l.pointsAwarded}pts`, `${l.estimatedMinutes}min`]);
  for (const a of d.attempts)
    rows.push(["quizAttempt", a._id, a.quizId, `${a.correctAnswers}/${a.totalQuestions}`, `${a.percentage}%`, `${a.pointsEarned}pts`]);
  for (const v of d.videoProgress)
    rows.push(["videoProgress", v._id, v.lessonId, `${v.percentageWatched}%`, v.completed ? "completed" : "in-progress", `${v.secondsWatched}s`]);
  for (const p of d.points)
    rows.push(["points", p._id, p.sourceType, `${p.points}`, p.description, ""]);
  for (const r of d.redemptions)
    rows.push(["redemption", r._id, r.rewardId, `${r.pointsSpent}pts`, r.status, ""]);
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

/** Full dataset as JSON (parent-only). */
export const exportJson = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const data = await ctx.runQuery(internal.exportData.allData, {});
    return JSON.stringify(data, null, 2);
  },
});

/** Full dataset as CSV (parent-only). */
export const exportCsv = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const data = await ctx.runQuery(internal.exportData.allData, {});
    return toCSV(data as unknown as DataBag);
  },
});
