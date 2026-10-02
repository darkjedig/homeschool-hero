import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

function localDay(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** One-time seed so streak survives the switch off full-history scans. */
async function historicalDays(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<Set<string>> {
  const days = new Set<string>();
  const [videos, attempts, interactives, marked] = await Promise.all([
    ctx.db
      .query("videoProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500),
    ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500),
    ctx.db
      .query("interactiveResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500),
    ctx.db
      .query("lessonCompletions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500),
  ]);
  for (const row of videos) {
    if (row.completed) days.add(localDay(row.updatedAt));
  }
  for (const row of attempts) days.add(localDay(row.completedAt));
  for (const row of interactives) {
    if (row.completed) days.add(localDay(row.createdAt));
  }
  for (const row of marked) days.add(localDay(row.completedAt));
  return days;
}

/**
 * Record that this student did something today. No-ops when today is already
 * stored, so a video progress write does not rewrite the sidebar's source.
 */
export async function ensureActivityDay(
  ctx: MutationCtx,
  userId: Id<"users">,
  now: number,
): Promise<void> {
  const day = localDay(now);
  const existing = await ctx.db
    .query("studentActivity")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (!existing) {
    const days = await historicalDays(ctx, userId);
    days.add(day);
    await ctx.db.insert("studentActivity", {
      userId,
      days: [...days].sort().slice(-400),
      updatedAt: now,
    });
    return;
  }
  if (existing.days.includes(day)) return;
  await ctx.db.patch(existing._id, {
    days: [...existing.days, day].slice(-400),
    updatedAt: now,
  });
}
