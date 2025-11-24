import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get the current user's Notion connection status.
 */
export const getConnection = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("notionConnections"),
      _creationTime: v.number(),
      userId: v.id("users"),
      accessToken: v.string(),
      workspaceName: v.optional(v.string()),
      workspaceIcon: v.optional(v.string()),
      botId: v.optional(v.string()),
      selectedDatabaseId: v.optional(v.string()),
      selectedDatabaseName: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const connection = await ctx.db
      .query("notionConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return connection;
  },
});

/**
 * Store a new Notion connection for the current user.
 * Called internally by the OAuth callback endpoint.
 */
export const storeConnection = mutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    workspaceName: v.optional(v.string()),
    workspaceIcon: v.optional(v.string()),
    botId: v.optional(v.string()),
  },
  returns: v.id("notionConnections"),
  handler: async (ctx, args) => {
    // Check if connection already exists
    const existing = await ctx.db
      .query("notionConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        workspaceName: args.workspaceName,
        workspaceIcon: args.workspaceIcon,
        botId: args.botId,
      });
      return existing._id;
    }

    // Create new connection
    const connectionId = await ctx.db.insert("notionConnections", {
      userId: args.userId,
      accessToken: args.accessToken,
      workspaceName: args.workspaceName,
      workspaceIcon: args.workspaceIcon,
      botId: args.botId,
    });

    return connectionId;
  },
});

/**
 * Update the selected Notion database for the current user.
 */
export const selectDatabase = mutation({
  args: {
    databaseId: v.string(),
    databaseName: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const connection = await ctx.db
      .query("notionConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!connection) {
      throw new Error("No Notion connection found");
    }

    await ctx.db.patch(connection._id, {
      selectedDatabaseId: args.databaseId,
      selectedDatabaseName: args.databaseName,
    });

    return null;
  },
});

/**
 * Disconnect the current user's Notion connection.
 */
export const disconnectNotion = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const connection = await ctx.db
      .query("notionConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (connection) {
      await ctx.db.delete(connection._id);
    }

    return null;
  },
});

