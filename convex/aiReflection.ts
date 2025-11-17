"use node";

import OpenAI from "openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Simple helper: extract plain text from TipTap JSON string
function extractPlainTextFromTipTapJson(jsonString: string): string {
  try {
    const doc = JSON.parse(jsonString);
    const texts: Array<string> = [];

    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      const nodeObj = node as { text?: string; content?: unknown[] };
      if (typeof nodeObj.text === "string") texts.push(nodeObj.text);
      if (Array.isArray(nodeObj.content)) nodeObj.content.forEach(walk);
    };

    walk(doc);
    return texts.join(" \n").trim();
  } catch (_e) {
    return "";
  }
}

const DEFAULT_PROMPT = `Read this article and offer sharp insights or questions that help the author think deeper.
Focus on the ending if relevant.
Always format your response as bullet points (using - or •).
Keep it brief - 2-4 bullet points maximum.
No emojis, no quotes, no preface.`;

export const getArticleReflection = action({
  args: {
    articleId: v.id("articles"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const article = await ctx.runQuery(
      internal.articles.getArticleForReflection,
      { articleId: args.articleId }
    );
    if (!article) {
      throw new Error("Article not found or unauthorized");
    }

    // Get user's custom prompt or use default
    const userPrompt: string | null = await ctx.runQuery(
      internal.users.getAiPromptInternal,
      { userId }
    );
    const promptTemplate: string = userPrompt || DEFAULT_PROMPT;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const client = new OpenAI({ apiKey });

    const plainText: string = extractPlainTextFromTipTapJson(article.content);
    const fullSource: string =
      plainText || article.title || "Untitled note";
    const baseText: string = fullSource

    // Put extra emphasis on how the article ends (last few paragraphs)
    const paragraphs = fullSource.split(/\n{2,}/);
    const tailText =
      paragraphs.length > 1
        ? paragraphs.slice(-3).join("\n\n")
        : baseText;

    const prompt: string = [
      promptTemplate,
      "",
      "Article:",
      baseText,
      "",
      "Ending:",
      tailText,
    ].join("\n");

    const completion = await client.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "system",
          content:
            "You are a sharp thinking partner. Respond in 2-3 sentences maximum. One key insight or question that adds real value. No quotes, no emojis, no preface.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const message = completion.choices[0]?.message?.content;

    if (!message || typeof message !== "string") {
      return "Let this page nudge you toward one small, kind step that matters today.";
    }

    return message.trim();
  },
});


