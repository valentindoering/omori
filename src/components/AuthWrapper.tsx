"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export function AuthWrapper({ children }: { children: ReactNode }) {
  const { signIn } = useAuthActions();

  return (
    <>
      <Unauthenticated>
        <div className="min-h-[100dvh] bg-gradient-to-b from-[#050506] via-[#101011] to-[#181819] text-[#E3E2E0] flex flex-col items-center justify-center px-6">
          {/* Main content */}
          <main className="w-full max-w-5xl py-10 md:py-14">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
              {/* Centered logo, title, copy, single sign-in button */}
              <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-6">
                <div className="flex flex-col items-center md:items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_18px_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
                    <Image
                      src="/favicon.ico"
                      alt="omori logo"
                      width={32}
                      height={32}
                      className="rounded"
                    />
                  </div>
                  <span className="text-sm tracking-[0.25em] uppercase text-gray-500">
                    omori
                  </span>
                </div>

                <div className="space-y-5">
                  <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                    Your diary, distilled.
                  </h1>
                  <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-xl">
                    A quiet, minimal space for your thoughts with semantic search, Notion sync,
                    and gentle recommendations that help you rediscover what matters.
                  </p>
                </div>

                <button
                  onClick={() => signIn("google")}
                  className="mt-1 inline-flex items-center gap-3 px-6 py-3 text-base bg-[#2a2a2a] text-foreground rounded-full hover:bg-[#353535] transition-colors font-medium"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
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
                  Sign In
                </button>
              </div>

              {/* Feature list, always visible */}
              <div className="flex-1">
                <div className="grid gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Semantic search</h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Find entries by meaning, not just keywords. Surface connections across years of writing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Notion-friendly</h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Import and export with Notion so your diary fits into the tools you already use.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Gentle prompts</h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Similarity-based suggestions nudge you toward entries worth revisiting, without noise.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Subtle legal links in bottom-right */}
          <div className="fixed bottom-5 right-6 text-[11px] text-gray-500 flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
}

