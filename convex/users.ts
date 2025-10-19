import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get the current authenticated user's information.
 * Returns null if not authenticated.
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      image: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      phone: v.optional(v.string()),
      phoneVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});

