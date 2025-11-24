"use node";

import OpenAI from "openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

const MAX_ARTICLE_CHARS = 8000;
const MAX_CONVERSATION_MESSAGES = 20;

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

const chatMessageValidator = v.object({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
});

function buildSystemPrompt(
  articleTitle: string,
  articleBody: string,
): string {
  const trimmedBody =
    articleBody.length > MAX_ARTICLE_CHARS
      ? `${articleBody.slice(0, MAX_ARTICLE_CHARS)}\n\n[truncated]`
      : articleBody;

  const sections = [
    "You are a calm, minimal writing partner. Keep replies short, clear, and conversational.",
    "Offer helpful questions, suggestions, or perspective without fluff or emojis.",
    `Article title: ${articleTitle || "Untitled note"}`,
    "Article body:",
    trimmedBody || "No article body was provided.",
  ];

  return sections.join("\n");
}

export const chatWithArticle = action({
  args: {
    articleId: v.id("articles"),
    messages: v.array(chatMessageValidator),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const article = await ctx.runQuery(
      internal.articles.getArticleForReflection,
      { articleId: args.articleId },
    );
    if (!article) {
      throw new Error("Article not found or unauthorized");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const client = new OpenAI({ apiKey });

    const plainText: string = extractPlainTextFromTipTapJson(article.content);
    const fullSource: string =
      plainText || article.title || "Untitled note";

    const systemPrompt = buildSystemPrompt(
      article.title ?? "Untitled note",
      fullSource,
    );

    const recentMessages = args.messages.slice(-MAX_CONVERSATION_MESSAGES);

    const completion = await client.chat.completions.create({
      model: "gpt-5.1",
      temperature: 0.6,
      messages: [
        { role: "system", content: systemPrompt },
        ...recentMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    const message = completion.choices[0]?.message?.content;

    if (!message || typeof message !== "string") {
      return "I'm here, but I couldn't form a response. Try asking again?";
    }

    return message.trim();
  },
});

