import { query } from "./_generated/server";
import { v } from "convex/values";

/** All active subjects, ordered by `order`. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subjects")
      .withIndex("by_active_order", (q) => q.eq("active", true))
      .collect();
  },
});

/** A single subject by slug. */
export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subjects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});
