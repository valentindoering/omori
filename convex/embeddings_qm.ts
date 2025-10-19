import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

export const listArticlesForEmbedding = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("articles"),
      content: v.string(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const rows: Array<Doc<"articles">> = await ctx.db
      .query("articles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return rows.map((a) => ({ _id: a._id, content: a.content }));
  },
});

export const setEmbedding = internalMutation({
  args: {
    articleId: v.id("articles"),
    embedding: v.array(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, { embedding: args.embedding });
    return null;
  },
});


