import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/** Only the auth provider can resolve these fixed household identities. */
export const authorize = internalMutation({
  args: { role: v.union(v.literal("student"), v.literal("parent")), pin: v.optional(v.string()) },
  handler: async (ctx, { role, pin }) => {
    const now = Date.now();
    let account = await ctx.db.query("familyAccounts").withIndex("by_role", q => q.eq("role", role)).unique();
    if (role === "parent") {
      if (!process.env.PARENT_PIN) return null;
      if (account && account.lockedUntil > now) return null;
      if (!account) {
        const id = await ctx.db.insert("familyAccounts", { role, failures: 0, lockedUntil: 0 });
        account = await ctx.db.get(id);
      }
      if (!account) return null;
      if (!/^\d{4}$/.test(pin ?? "") || pin !== process.env.PARENT_PIN) {
        const failures = account.lockedUntil > 0 ? 1 : account.failures + 1;
        await ctx.db.patch(account._id, { failures, lockedUntil: failures >= 5 ? now + 5 * 60_000 : 0 });
        // Return instead of throwing so the failed-attempt counter commits.
        return null;
      }
      await ctx.db.patch(account._id, { failures: 0, lockedUntil: 0 });
    }
    if (account?.userId) return { userId: account.userId };
    // A new stable identity avoids reusing old anonymous parent sessions.
    const userId = await ctx.db.insert("users", { name: role === "student" ? "Hudson" : "Parent" });
    await ctx.db.insert("userProfiles", { userId, role, displayName: role === "student" ? "Hudson" : "Parent", createdAt: now, updatedAt: now });
    if (account) await ctx.db.patch(account._id, { userId });
    else await ctx.db.insert("familyAccounts", { role, userId, failures: 0, lockedUntil: 0 });
    return { userId };
  },
});
