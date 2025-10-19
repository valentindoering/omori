"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export function UserMenu() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  
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

      <MenuItems className="absolute right-0 mt-2 w-48 bg-hover border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
        <div className="px-4 py-3 border-b border-gray-700">
          <p className="text-sm text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        <MenuItem>
          <button
            onClick={() => void signOut()}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2a2a2a] transition-colors"
          >
            Log out
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}

