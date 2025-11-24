import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Schema for the Omori application.
 * 
 * The articles table stores:
 * - title: The article title (defaults to "Untitled")
 * - content: The article content in JSON format (TipTap document)
 * - userId: The ID of the user who created the article
 * 
 * We use authTables from Convex Auth to handle user authentication.
 */
export default defineSchema({
  ...authTables,
  
  userSettings: defineTable({
    userId: v.id("users"),
    aiPrompt: v.optional(v.string()), // Custom AI prompt for reflections
  }).index("by_user", ["userId"]),
  
  notionOAuthStates: defineTable({
    state: v.string(), // Random state token for OAuth CSRF protection
    userId: v.id("users"), // User who initiated OAuth flow
    expiresAt: v.number(), // Expiration timestamp (states expire after 10 minutes)
  }).index("by_state", ["state"]),
  
  notionConnections: defineTable({
    userId: v.id("users"),
    accessToken: v.string(), // Notion OAuth access token
    workspaceName: v.optional(v.string()), // Notion workspace name
    workspaceIcon: v.optional(v.string()), // Notion workspace icon
    botId: v.optional(v.string()), // Notion bot ID
  }).index("by_user", ["userId"]),
  
  articles: defineTable({
    title: v.string(),
    content: v.string(), // Stored as JSON string from TipTap
    userId: v.id("users"), // Reference to the authenticated user in the users table
    icon: v.optional(v.string()), // Custom icon for the article
    createdAt: v.number(), // Creation time - set to current time for new articles, or original Notion time for imports
    originalHtml: v.optional(v.string()), // Original HTML from Notion import (preserved for reference)
    embedding: v.optional(v.array(v.number())), // Article embedding vector (e.g., 768 dims)
  })
    // Index by userId (Convex automatically adds _creationTime to all indexes)
    .index("by_user", ["userId"])
    .index("by_user_and_createdAt", ["userId", "createdAt"]) 
    // Search index for title scoped by user for efficient server-side search
    .searchIndex("search_title_by_user", {
      searchField: "title",
      filterFields: ["userId"],
    })
    // Vector index for semantic/embedding search
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["userId"],
    }),
});

