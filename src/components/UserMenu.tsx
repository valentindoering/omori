"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const notionConnection = useQuery(api.notion.getConnection);
  const disconnectNotion = useMutation(api.notion.disconnectNotion);
  const createState = useMutation(api.notionOAuthState.createState);
  const recalcAll = useAction(api.embeddings.recalculateAllEmbeddings);
  const router = useRouter();
  
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleConnectNotion = async () => {
    const clientId = process.env.NEXT_PUBLIC_NOTION_OAUTH_CLIENT_ID;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!clientId || !convexUrl) {
      alert("Notion OAuth is not configured");
      return;
    }

    try {
      // Create a state token to maintain user context through OAuth flow
      const state = await createState();

      // Convert .cloud to .site for HTTP endpoints
      // Convex HTTP endpoints are always on .site, not .cloud
      const httpUrl = convexUrl.replace('.convex.cloud', '.convex.site');
      
      // Build OAuth URL - redirect to Convex HTTP endpoint with state
      const redirectUri = `${httpUrl}/notion/callback`;
      const oauthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      // Redirect to Notion OAuth
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("Failed to create OAuth state:", error);
      alert("Failed to initiate Notion connection. Please try again.");
    }
  };

  const handleDisconnectNotion = async () => {
    if (confirm("Are you sure you want to disconnect your Notion account?")) {
      await disconnectNotion();
    }
  };

  return (
    <Menu>
      <MenuButton className="w-10 h-10 rounded-full hover:bg-hover flex items-center justify-center text-sm text-white font-medium transition-colors">
        {initials}
      </MenuButton>

      <MenuItems
        transition
        anchor="bottom end"
        className="w-56 origin-top-right rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm text-base text-white transition duration-100 ease-out [--anchor-gap:5px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 z-50"
      >
        <div className="px-4 py-3.5 border-b border-white/5">
          <p className="text-base text-white truncate">{user?.name}</p>
          <p className="text-sm text-gray-400 truncate">{user?.email}</p>
        </div>
        <div className="p-1.5">
          {notionConnection ? (
            <>
              <MenuItem>
                <button
                  onClick={() => router.push("/import")}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-white data-focus:bg-white/10 transition-colors"
                >
                  Import from Notion
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={handleDisconnectNotion}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-white data-focus:bg-white/10 transition-colors"
                >
                  Disconnect Notion
                </button>
              </MenuItem>
            </>
          ) : (
            <MenuItem>
              <button
                onClick={handleConnectNotion}
                className="w-full text-left px-3.5 py-2 rounded-lg text-white data-focus:bg-white/10 transition-colors"
              >
                Connect Notion
              </button>
            </MenuItem>
          )}
          <MenuItem>
            <button
              onClick={() => void recalcAll({})}
              className="w-full text-left px-3.5 py-2 rounded-lg text-white data-focus:bg-white/10 transition-colors"
            >
              Calculate embeddings
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={() => signOut()}
              className="w-full text-left px-3.5 py-2 rounded-lg text-white data-focus:bg-white/10 transition-colors"
            >
              Log out
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}

