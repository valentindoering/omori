"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Fetch available databases from the user's Notion workspace.
 */
export const fetchDatabases = action({
  args: {},
  returns: v.array(v.object({
    id: v.string(),
    title: v.string(),
    icon: v.optional(v.string()),
  })),
  handler: async (ctx): Promise<Array<{
    id: string;
    title: string;
    icon?: string;
  }>> => {
    // Get the user's Notion connection
    const connection: any = await ctx.runQuery(api.notion.getConnection);
    
    if (!connection) {
      throw new Error("No Notion connection found");
    }

    try {
      const response: Response = await fetch("https://api.notion.com/v1/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${connection.accessToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filter: {
            value: "database",
            property: "object",
          },
          sort: {
            direction: "descending",
            timestamp: "last_edited_time",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch Notion databases:", errorText);
        throw new Error("Failed to fetch Notion databases");
      }

      const data: any = await response.json();
      
      // Extract database info
      const databases: Array<{
        id: string;
        title: string;
        icon?: string;
      }> = data.results.map((db: any) => {
        // Get title from database properties
        const titleProperty = db.title?.[0]?.plain_text || "Untitled";
        
        // Get icon (emoji or external URL)
        let icon: string | undefined;
        if (db.icon?.type === "emoji") {
          icon = db.icon.emoji;
        } else if (db.icon?.type === "external") {
          icon = db.icon.external.url;
        }

        return {
          id: db.id,
          title: titleProperty,
          icon,
        };
      });

      return databases;
    } catch (error) {
      console.error("Error fetching Notion databases:", error);
      throw error;
    }
  },
});

/**
 * Save an article to the selected Notion database.
 */
export const saveArticleToNotion = internalAction({
  args: {
    articleId: v.id("articles"),
    userId: v.id("users"),
  },
  returns: v.object({
    success: v.boolean(),
    pageUrl: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    pageUrl?: string;
    error?: string;
  }> => {
    // Get the user's Notion connection
    const connection: any = await ctx.runQuery(api.notion.getConnection);
    
    if (!connection || !connection.selectedDatabaseId) {
      return {
        success: false,
        error: "No Notion database selected",
      };
    }

    // Get the article
    const article = await ctx.runQuery(api.articles.getArticle, {
      articleId: args.articleId,
    });

    if (!article) {
      return {
        success: false,
        error: "Article not found",
      };
    }

    try {
      // Parse the TipTap JSON content
      const content = JSON.parse(article.content);
      
      // Convert TipTap content to Notion blocks
      const notionBlocks = convertTipTapToNotionBlocks(content);

      // Create a new page in Notion
      const response: Response = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${connection.accessToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent: {
            database_id: connection.selectedDatabaseId,
          },
          properties: {
            title: {
              title: [
                {
                  text: {
                    content: article.title,
                  },
                },
              ],
            },
          },
          children: notionBlocks,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create Notion page:", errorText);
        return {
          success: false,
          error: "Failed to create Notion page",
        };
      }

      const data: any = await response.json();
      
      return {
        success: true,
        pageUrl: data.url,
      };
    } catch (error) {
      console.error("Error saving to Notion:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Convert TipTap JSON to Notion blocks.
 * This is a simplified converter - you may need to expand this based on your content.
 */
function convertTipTapToNotionBlocks(content: any): any[] {
  const blocks: any[] = [];

  if (!content.content) {
    return blocks;
  }

  for (const node of content.content) {
    if (node.type === "paragraph") {
      const text = extractText(node);
      if (text.trim()) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: text,
                },
              },
            ],
          },
        });
      }
    } else if (node.type === "heading") {
      const level = node.attrs?.level || 1;
      const text = extractText(node);
      const headingType = `heading_${Math.min(level, 3)}` as "heading_1" | "heading_2" | "heading_3";
      
      blocks.push({
        object: "block",
        type: headingType,
        [headingType]: {
          rich_text: [
            {
              type: "text",
              text: {
                content: text,
              },
            },
          ],
        },
      });
    } else if (node.type === "bulletList" || node.type === "orderedList") {
      const listBlocks = convertListToNotionBlocks(node);
      blocks.push(...listBlocks);
    }
  }

  // Notion requires at least one block
  if (blocks.length === 0) {
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "",
            },
          },
        ],
      },
    });
  }

  return blocks;
}

function extractText(node: any): string {
  if (node.text) {
    return node.text;
  }
  if (node.content) {
    return node.content.map((n: any) => extractText(n)).join("");
  }
  return "";
}

function convertListToNotionBlocks(listNode: any): any[] {
  const blocks: any[] = [];
  const isOrdered = listNode.type === "orderedList";

  if (listNode.content) {
    for (const item of listNode.content) {
      if (item.type === "listItem") {
        const text = extractText(item);
        blocks.push({
          object: "block",
          type: isOrdered ? "numbered_list_item" : "bulleted_list_item",
          [isOrdered ? "numbered_list_item" : "bulleted_list_item"]: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: text,
                },
              },
            ],
          },
        });
      }
    }
  }

  return blocks;
}

