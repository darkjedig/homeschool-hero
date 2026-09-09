import { convexAuth } from "@convex-dev/auth/server";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ConvexCredentials({
    id: "family",
    authorize: async (credentials, ctx): Promise<{ userId: Id<"users"> } | null> => {
      const role = credentials.role;
      if (role !== "student" && role !== "parent") return null;
      return await ctx.runMutation(internal.familyAccess.authorize, {
        role, pin: typeof credentials.pin === "string" ? credentials.pin : undefined,
      });
    },
  })],
});
