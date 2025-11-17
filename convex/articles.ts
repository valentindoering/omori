import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { Doc } from "./_generated/dataModel";

// All available icons from the icon picker
const ALL_ICONS = [
  // Nature
  "Flower", "Flower2", "Trees", "TreePine", "Sprout", "Leaf",
  "Sun", "Moon", "CloudRain", "Cloud", "CloudSnow", "Snowflake",
  "Waves", "Mountain", "Flame", "Sparkles", "Wind", "Rainbow",
  // Emotions & Love
  "Heart", "HeartHandshake", "HeartCrack", "Smile", "Frown", "Meh",
  "Laugh", "Angry", "PartyPopper", "Ghost", "Skull", "Eye",
  "ThumbsUp", "Peace", "Handshake", "MessageHeart", "SmilePlus", "Annoyed",
  // Creative & Art
  "Palette", "Brush", "Pen", "PenTool", "Feather", "Sparkle",
  "Wand", "Wand2", "Music", "Music2", "Guitar", "Headphones",
  "Camera", "Film", "Image", "Drama", "Mic", "BookOpen",
  // Mystical & Magic
  "Star", "Stars", "Sparkles", "Zap", "Crown", "Gem",
  "Diamond", "Circle", "Moon", "Sun", "Eclipse", "Orbit",
  "Atom", "Infinity", "Eye", "Ghost", "Skull", "Trophy",
  // Food & Drinks
  "Coffee", "Wine", "Beer", "Pizza", "Cake", "IceCream",
  "Apple", "Cherry", "Citrus", "Candy", "Cookie", "Soup",
  "Utensils", "UtensilsCrossed", "Martini", "Milk", "Flame", "Egg",
  // Travel & Places
  "Plane", "Ship", "Car", "Train", "Sailboat", "Anchor",
  "MapPin", "Map", "Compass", "Globe", "Home", "Hotel",
  "Building", "Church", "Castle", "Mountain", "Palmtree", "Island",
  // Animals
  "Bird", "Bug", "Cat", "Dog", "Fish", "Rabbit",
  "Squirrel", "Turtle", "Snail", "Beef", "Rat", "Egg",
  // Time & Seasons
  "Calendar", "CalendarDays", "Clock", "Timer", "Hourglass", "Sunrise",
  "Sunset", "SunMoon", "CloudSun", "CloudMoon", "Snowflake", "Sprout",
  "Leaf", "Flower", "Sun", "Moon", "Clock3", "Watch",
  // Objects & Symbols
  "Book", "BookMarked", "Bookmark", "Key", "Lock", "Gift",
  "Package", "Flag", "Bell", "Anchor", "Umbrella", "Glasses",
  "Watch", "Shirt", "Footprints", "Badge", "Shield", "Bike",
];

/**
 * Create a new article with default "Untitled" title and a random icon.
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

    // Select a random icon
    const randomIcon = ALL_ICONS[Math.floor(Math.random() * ALL_ICONS.length)];

    // Create article with empty content (TipTap will initialize it)
    const articleId = await ctx.db.insert("articles", {
      title: "Untitled",
      content: JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
      userId,
      icon: randomIcon,
      createdAt: Date.now(), // Set creation time to now for new articles
    });

    return articleId;
  },
});

/**
 * List all articles for the current user with pagination.
 * Returns articles sorted by createdAt (newest first).
 */
export const listArticles = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("articles"),
        _creationTime: v.number(),
        createdAt: v.number(),
        title: v.string(),
        userId: v.id("users"),
        icon: v.optional(v.string()),
        hasEmbedding: v.boolean(),
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

    const search = (args.search ?? "").trim();
    let result;
    if (search.length > 0) {
      // Use search index on title, filtered by user, newest first by createdAt
      result = await ctx.db
        .query("articles")
        .withSearchIndex("search_title_by_user", (q) =>
          q.search("title", search).eq("userId", userId)
        )
        .paginate(args.paginationOpts);
    } else {
      // Default listing by user, newest first
      result = await ctx.db
        .query("articles")
        .withIndex("by_user_and_createdAt", (q) => q.eq("userId", userId))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return {
      page: result.page.map((article: Doc<"articles">) => ({
        _id: article._id,
        _creationTime: article._creationTime,
        createdAt: article.createdAt,
        title: article.title,
        userId: article.userId,
        icon: article.icon,
        // presence-only indicator
        hasEmbedding: article.embedding !== undefined,
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
      createdAt: v.number(),
      title: v.string(),
      content: v.string(),
      userId: v.id("users"),
      icon: v.optional(v.string()),
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

    // Return article without embedding (not needed for display/editing)
    return {
      _id: article._id,
      _creationTime: article._creationTime,
      createdAt: article.createdAt,
      title: article.title,
      content: article.content,
      userId: article.userId,
      icon: article.icon,
    };
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
 * Update an article's icon.
 */
export const updateIcon = mutation({
  args: {
    articleId: v.id("articles"),
    icon: v.string(),
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
      icon: args.icon,
    });

    return null;
  },
});

/**
 * Batch import articles from Notion HTML export.
 * Preserves original creation time from Notion.
 */
export const batchImportArticles = mutation({
  args: {
    articles: v.array(
      v.object({
        title: v.string(),
        content: v.string(), // TipTap JSON format
        createdAt: v.number(), // Original Notion creation time
        icon: v.optional(v.string()),
        originalHtml: v.optional(v.string()), // Original HTML from Notion
      })
    ),
  },
  returns: v.object({
    success: v.boolean(),
    count: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    let count = 0;
    for (const article of args.articles) {
      await ctx.db.insert("articles", {
        title: article.title,
        content: article.content,
        userId,
        icon: article.icon,
        createdAt: article.createdAt,
        originalHtml: article.originalHtml,
      });
      count++;
    }

    return { success: true, count };
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

/**
 * Internal query: Get a single article by ID for use in actions.
 * Only returns the article if it belongs to the current user.
 */
export const getArticleForReflection = internalQuery({
  args: { articleId: v.id("articles") },
  returns: v.union(
    v.object({
      _id: v.id("articles"),
      _creationTime: v.number(),
      createdAt: v.number(),
      title: v.string(),
      content: v.string(),
      userId: v.id("users"),
      icon: v.optional(v.string()),
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

    // Return article without embedding (not needed for reflection)
    return {
      _id: article._id,
      _creationTime: article._creationTime,
      createdAt: article.createdAt,
      title: article.title,
      content: article.content,
      userId: article.userId,
      icon: article.icon,
    };
  },
});

