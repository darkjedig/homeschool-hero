import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireParent } from "./authHelpers";

const DEFAULT_MODEL = "openai/gpt-4o-mini";

function singleDoc() {
  // Single parent-scoped settings doc; identified by a fixed key.
  return { id: "singleton" } as const;
}

/** Client-facing AI config. The raw key is NEVER returned — only keyIsSet. */
export const getAiConfig = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("settings").first();
    return {
      keyIsSet: !!doc?.openRouterKey,
      model: doc?.openRouterModel ?? DEFAULT_MODEL,
      youtubeSearchEnabled: doc?.youtubeSearchEnabled ?? false,
    };
  },
});

/** Parent-only: save the BYOK key + model. */
export const saveAiConfig = mutation({
  args: {
    openRouterKey: v.optional(v.string()),
    openRouterModel: v.string(),
    youtubeSearchEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireParent(ctx);
    const existing = await ctx.db.query("settings").first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        // Only overwrite the key when a non-empty value is supplied.
        openRouterKey:
          args.openRouterKey !== undefined && args.openRouterKey !== ""
            ? args.openRouterKey
            : existing.openRouterKey,
        openRouterModel: args.openRouterModel,
        youtubeSearchEnabled: args.youtubeSearchEnabled,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("settings", {
      openRouterKey: args.openRouterKey ?? undefined,
      openRouterModel: args.openRouterModel,
      youtubeSearchEnabled: args.youtubeSearchEnabled,
      updatedAt: now,
    });
  },
});

/** Internal: read the raw key + model for use inside Convex actions (parent-only). */
export const getAiConfigInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    await requireParent(ctx);
    const doc = await ctx.db.query("settings").first();
    return {
      key: doc?.openRouterKey ?? null,
      model: doc?.openRouterModel ?? DEFAULT_MODEL,
      youtubeSearchEnabled: doc?.youtubeSearchEnabled ?? false,
    };
  },
});

void singleDoc;
