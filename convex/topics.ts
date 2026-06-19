import { query } from "./_generated/server";
import { v } from "convex/values";

/** Topics for a subject, ordered by `order`. */
export const listBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("topics")
      .withIndex("by_subject_and_order", (q) =>
        q.eq("subjectId", args.subjectId),
      )
      .collect();
  },
});
