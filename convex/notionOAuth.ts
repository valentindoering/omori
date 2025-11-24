"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Internal action to handle Notion OAuth token exchange.
 * This runs in Node.js to access Buffer for Basic auth encoding.
 */
export const handleOAuthCallback = internalAction({
  args: {
    code: v.string(),
    state: v.string(),
    redirectUri: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    redirectUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    const clientId = process.env.NOTION_OAUTH_CLIENT_ID;
    const clientSecret = process.env.NOTION_OAUTH_CLIENT_SECRET;
    const appUrl = process.env.APP_URL;

    if (!clientId || !clientSecret) {
      console.error("Missing Notion OAuth credentials");
      return {
        success: false,
        redirectUrl: `${appUrl}/?notion_error=server_configuration`,
      };
    }

    if (!appUrl) {
      console.error("Missing APP_URL environment variable");
      return {
        success: false,
        redirectUrl: "/?notion_error=server_configuration",
      };
    }

    try {
      // Validate state and get user ID
      const userId = await ctx.runMutation(api.notionOAuthState.validateAndConsumeState, {
        state: args.state,
      });
      
      if (!userId) {
        console.error("Invalid or expired OAuth state");
        return {
          success: false,
          redirectUrl: `${appUrl}/?notion_error=invalid_state`,
        };
      }

      // Exchange code for access token using Basic auth
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      
      const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code: args.code,
          redirect_uri: args.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Token exchange failed:", errorData);
        return {
          success: false,
          redirectUrl: `${appUrl}/?notion_error=token_exchange_failed`,
        };
      }

      const tokenData = await tokenResponse.json();

      // Store the connection in the database
      // Convert null values to undefined (Convex v.optional expects undefined, not null)
      await ctx.runMutation(api.notion.storeConnection, {
        userId,
        accessToken: tokenData.access_token,
        workspaceName: tokenData.workspace_name ?? undefined,
        workspaceIcon: tokenData.workspace_icon ?? undefined,
        botId: tokenData.bot_id ?? undefined,
      });

      return {
        success: true,
        redirectUrl: `${appUrl}/?notion_connected=true`,
      };
    } catch (err) {
      console.error("Notion OAuth error:", err);
      return {
        success: false,
        redirectUrl: `${appUrl}/?notion_error=unexpected_error`,
      };
    }
  },
});

