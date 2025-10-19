import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

/**
 * Create a new article with default "Untitled" title.
 * Returns the ID of the newly created article.
 */
export const createArticle = mutation({
  args: {},
  returns: v.id("articles"),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Create article with empty content (TipTap will initialize it)
    const articleId = await ctx.db.insert("articles", {
      title: "Untitled",
      content: JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
      userId,
    });

    return articleId;
  },
});

/**
 * List all articles for the current user with pagination.
 * Returns articles sorted by creation time (newest first).
 */
export const listArticles = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("articles"),
        _creationTime: v.number(),
        title: v.string(),
        userId: v.id("users"),
      })
    ),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Query articles by user, ordered by creation time (newest first)
    const result = await ctx.db
      .query("articles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      page: result.page.map((article) => ({
        _id: article._id,
        _creationTime: article._creationTime,
        title: article.title,
        userId: article.userId,
      })),
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

/**
 * Get a single article by ID.
 * Only returns the article if it belongs to the current user.
 */
export const getArticle = query({
  args: { articleId: v.id("articles") },
  returns: v.union(
    v.object({
      _id: v.id("articles"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      userId: v.id("users"),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const article = await ctx.db.get(args.articleId);
    
    // Only return article if it belongs to the current user
    if (!article || article.userId !== userId) {
      return null;
    }

    return article;
  },
});

/**
 * Update an article's title.
 */
export const updateTitle = mutation({
  args: {
    articleId: v.id("articles"),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const article = await ctx.db.get(args.articleId);
    
    // Only allow updating if article belongs to current user
    if (!article || article.userId !== userId) {
      throw new Error("Article not found or unauthorized");
    }

    await ctx.db.patch(args.articleId, {
      title: args.title,
    });

    return null;
  },
});

/**
 * Update an article's content.
 * Content should be a JSON string representing the TipTap document.
 */
export const updateContent = mutation({
  args: {
    articleId: v.id("articles"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const article = await ctx.db.get(args.articleId);
    
    // Only allow updating if article belongs to current user
    if (!article || article.userId !== userId) {
      throw new Error("Article not found or unauthorized");
    }

    await ctx.db.patch(args.articleId, {
      content: args.content,
    });

    return null;
  },
});

/**
 * Delete an article.
 */
export const deleteArticle = mutation({
  args: {
    articleId: v.id("articles"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const article = await ctx.db.get(args.articleId);
    if (!article || article.userId !== userId) {
      throw new Error("Article not found or unauthorized");
    }

    await ctx.db.delete(args.articleId);
    return null;
  },
});

