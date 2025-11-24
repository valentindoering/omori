"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * Component to handle Notion OAuth callback notifications.
 * Shows success/error messages and cleans up URL parameters.
 */
export function NotionOAuthHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const notionConnected = searchParams.get("notion_connected");
    const notionError = searchParams.get("notion_error");

    if (notionConnected === "true") {
      // Show success message
      alert("✅ Successfully connected to Notion!");
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("notion_connected");
      router.replace(url.pathname);
    } else if (notionError) {
      // Show error message
      const errorMessages: Record<string, string> = {
        missing_code: "OAuth callback missing authorization code",
        missing_state: "OAuth callback missing state parameter",
        invalid_state: "OAuth state validation failed. Please try again.",
        server_configuration: "Server configuration error. Please contact support.",
        token_exchange_failed: "Failed to exchange authorization code for access token",
        not_authenticated: "You must be logged in to connect Notion",
        unexpected_error: "An unexpected error occurred",
      };

      const errorMessage = errorMessages[notionError] || notionError;
      alert(`❌ Failed to connect Notion: ${errorMessage}`);
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("notion_error");
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  return null;
}

