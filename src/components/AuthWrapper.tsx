"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { ReactNode } from "react";
import Image from "next/image";

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
    <div className="h-screen w-screen fixed inset-0 flex items-center justify-center overflow-hidden">
      <div className="text-center flex flex-col items-center space-y-1">
        <Image
          src="/favicon.ico"
          alt="omori logo"
          width={32}
          height={32}
          className="rounded"
        />
        <h1 className="text-2xl font-bold">omori</h1>

        <button
          onClick={() => signIn("google")}
          className="flex items-center gap-3 px-4 py-1.5 mt-3 text-sm bg-[#2a2a2a] text-foreground rounded-lg hover:bg-[#353535] transition-colors font-medium"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

