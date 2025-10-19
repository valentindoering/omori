"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { GoogleGenAI } from "@google/genai";
import { internal } from "./_generated/api";

// Helper: extract plain text from TipTap JSON string (very simple)
function extractPlainTextFromTipTapJson(jsonString: string): string {
  try {
    const doc = JSON.parse(jsonString);
    const texts: Array<string> = [];

    const walk = (node: any) => {
      if (!node || typeof node !== "object") return;
      if (typeof node.text === "string") texts.push(node.text);
      if (Array.isArray(node.content)) node.content.forEach(walk);
    };

    walk(doc);
    return texts.join(" \n").trim();
  } catch (_e) {
    return "";
  }
}

// Public action: generate embedding vector from a search query string
export const embedSearchQuery = action({
  args: { query: v.string() },
  returns: v.array(v.number()),
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: args.query,
      config: { outputDimensionality: 768 },
    } as any);

    const embeddings = response.embeddings as Array<{ values: Array<number> }>;
    return embeddings[0]?.values ?? [];
  },
});

// Public action: perform embedding search - embed query then run vector search
export const searchByEmbedding: any = action({
  args: { 
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("articles"),
      _creationTime: v.number(),
      createdAt: v.number(),
      title: v.string(),
      userId: v.id("users"),
      icon: v.optional(v.string()),
      hasEmbedding: v.boolean(),
      _score: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    // Generate embedding from search query
    const embedding: Array<number> = await ctx.runAction(
      (await import("./_generated/api")).api.embeddings.embedSearchQuery,
      { query: args.query }
    );

    // Run vector similarity search (vectorSearch is only available in actions)
    const results = await ctx.vectorSearch("articles", "by_embedding", {
      vector: embedding,
      limit: args.limit ?? 20,
      filter: (q: any) => q.eq("userId", userId),
    });

    // Load full article documents
    const articleIds = results.map((r: any) => r._id);
    const articles = await ctx.runQuery(
      internal.embeddings_qm.fetchArticlesByIds,
      { ids: articleIds }
    );

    // Merge scores back in
    const scoresMap = new Map(results.map((r: any) => [r._id, r._score]));
    return articles.map((article: any) => ({
      ...article,
      _score: scoresMap.get(article._id) ?? 0,
    }));
  },
});

// Public action: recompute embeddings for all of the current user's articles.
export const recalculateAllEmbeddings = action({
  args: {},
  returns: v.object({ count: v.number() }),
  handler: async (ctx) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");

    const ai = new GoogleGenAI({ apiKey });

    const items = await ctx.runQuery(internal.embeddings_qm.listArticlesForEmbedding, {});

    // Prepare plain texts
    const texts = items.map((it) => extractPlainTextFromTipTapJson(it.content));

    // Batch size: 16 to balance throughput vs limits
    const BATCH = 16;
    let updated = 0;
    for (let i = 0; i < items.length; i += BATCH) {
      const batchItems = items.slice(i, i + BATCH);
      const batchTexts = texts.slice(i, i + BATCH);

      // Skip entirely empty batch
      const nonEmptyIndices = batchTexts
        .map((t, idx) => (t ? idx : -1))
        .filter((x) => x >= 0);

      // If all empty, set empty embeddings to avoid reprocessing later
      if (nonEmptyIndices.length === 0) {
        for (const doc of batchItems) {
          await ctx.runMutation(internal.embeddings_qm.setEmbedding, {
            articleId: doc._id as Id<"articles">,
            embedding: [],
          });
          updated++;
        }
        continue;
      }

      const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: batchTexts,
        config: { outputDimensionality: 768 },
      } as any);

      // The SDK returns an array of embeddings matching input order
      const embeddings = response.embeddings as Array<{ values: Array<number> }>;

      for (let j = 0; j < batchItems.length; j++) {
        const doc = batchItems[j];
        const emb = embeddings?.[j]?.values ?? [];
        await ctx.runMutation(internal.embeddings_qm.setEmbedding, {
          articleId: doc._id as Id<"articles">,
          embedding: emb,
        });
        updated++;
      }
    }

    return { count: updated };
  },
});


