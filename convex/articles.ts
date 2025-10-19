import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

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
        icon: v.optional(v.string()),
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
        icon: article.icon,
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

