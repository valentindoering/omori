import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Create a new OAuth state token for the current user.
 * This token is used to maintain user context through the OAuth flow.
 */
export const createState = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Generate a random state token
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Store it with expiration (10 minutes)
    const expiresAt = Date.now() + 10 * 60 * 1000;
    
    await ctx.db.insert("notionOAuthStates", {
      state,
      userId,
      expiresAt,
    });

    return state;
  },
});

/**
 * Validate and consume an OAuth state token, returning the associated user ID.
 * Deletes the state after validation (one-time use).
 */
export const validateAndConsumeState = mutation({
  args: { state: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args) => {
    const stateRecord = await ctx.db
      .query("notionOAuthStates")
      .withIndex("by_state", (q) => q.eq("state", args.state))
      .first();

    if (!stateRecord) {
      console.error("State not found:", args.state);
      return null;
    }

    // Check if expired
    if (stateRecord.expiresAt < Date.now()) {
      console.error("State expired");
      // Clean up expired state
      await ctx.db.delete(stateRecord._id);
      return null;
    }

    // Delete the state (one-time use)
    await ctx.db.delete(stateRecord._id);

    return stateRecord.userId;
  },
});


