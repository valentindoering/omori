"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { ReactNode } from "react";

/**
 * Authentication wrapper component.
 * Shows login screen for unauthenticated users,
 * and the app content for authenticated users.
 */

export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <Unauthenticated>
        <LoginScreen />
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
}

function LoginScreen() {
  const { signIn } = useAuthActions();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-white">Omori</h1>
        <button
          onClick={() => signIn("google")}
          className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

