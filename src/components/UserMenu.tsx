"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const recalcAll = useAction(api.embeddings.recalculateAllEmbeddings);
  const router = useRouter();
  
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <Menu>
      <MenuButton className="w-8 h-8 rounded-full hover:bg-hover flex items-center justify-center text-xs text-white font-medium transition-colors">
        {initials}
      </MenuButton>

      <MenuItems
        transition
        anchor="bottom end"
        className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm text-sm text-white transition duration-100 ease-out [--anchor-gap:4px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 z-50"
      >
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-sm text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        <div className="p-1">
          <MenuItem>
            <button
              onClick={() => router.push("/import")}
              className="w-full text-left px-3 py-1.5 rounded-lg text-white data-focus:bg-white/10 transition-colors"
            >
              Import from Notion
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={() => void recalcAll({})}
              className="w-full text-left px-3 py-1.5 rounded-lg text-white data-focus:bg-white/10 transition-colors"
            >
              Calculate embeddings
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={() => void signOut()}
              className="w-full text-left px-3 py-1.5 rounded-lg text-white data-focus:bg-white/10 transition-colors"
            >
              Log out
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}

