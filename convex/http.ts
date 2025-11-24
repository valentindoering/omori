import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";

/**
 * HTTP router configuration.
 * 
 * This sets up the HTTP endpoints for authentication.
 * The auth.addHttpRoutes() method registers all necessary OAuth endpoints.
 */
const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * Notion OAuth Callback Route
 * Receives the OAuth callback and delegates to a Node.js action for token exchange
 */
http.route({
  path: "/notion/callback",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const appUrl = process.env.APP_URL;

    // Handle OAuth errors
    if (error) {
      const errorDescription = url.searchParams.get("error_description") || "Unknown error";
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${appUrl}/?notion_error=${encodeURIComponent(errorDescription)}`,
        },
      });
    }

    // Validate required parameters
    if (!code) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${appUrl}/?notion_error=missing_code`,
        },
      });
    }

    if (!state) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${appUrl}/?notion_error=missing_state`,
        },
      });
    }

    // Call the Node.js action to handle token exchange
    const result = await ctx.runAction(internal.notionOAuth.handleOAuthCallback, {
      code,
      state,
      redirectUri: `${url.origin}/notion/callback`,
    });

    // Redirect to the result URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: result.redirectUrl,
      },
    });
  }),
});

export default http;

