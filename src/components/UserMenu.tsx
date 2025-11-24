"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ManageNotionDialog } from "./ManageNotionDialog";

export function UserMenu() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const notionConnection = useQuery(api.notion.getConnection);
  const recalcAll = useAction(api.embeddings.recalculateAllEmbeddings);
  const router = useRouter();
  const [isNotionDialogOpen, setIsNotionDialogOpen] = useState(false);
  
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <>
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
            <MenuItem>
              <button
                onClick={() => setIsNotionDialogOpen(true)}
                className="w-full text-left px-3.5 py-2 rounded-lg text-white data-focus:bg-white/10 transition-colors"
              >
                <div>Notion Connection</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${notionConnection ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span className="text-xs text-gray-400">
                    {notionConnection ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </button>
            </MenuItem>
            {notionConnection && (
              <MenuItem>
                <button
                  onClick={() => router.push("/import")}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-white data-focus:bg-white/10 transition-colors"
                >
                  Import from Notion
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

      <ManageNotionDialog
        isOpen={isNotionDialogOpen}
        onClose={() => setIsNotionDialogOpen(false)}
      />
    </>
  );
}

