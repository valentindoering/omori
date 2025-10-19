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

// Public action: recompute embeddings for all of the current user's articles.
export const recalculateAllEmbeddings = action({
  args: {},
  returns: v.object({ count: v.number() }),
  handler: async (ctx) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");

    // Dynamically import to keep client bundle clean
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
      });

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


