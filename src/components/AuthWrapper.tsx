"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export function AuthWrapper({ children }: { children: ReactNode }) {
  const { signIn } = useAuthActions();
  const [showBenefits, setShowBenefits] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBenefits(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Unauthenticated>
        <div className="min-h-[100dvh] bg-[#191919] text-[#E3E2E0]">
          {/* Header with Sign In Button */}
          <header className="fixed top-0 left-0 right-0 w-full border-b border-gray-800 bg-[#191919]/70 backdrop-blur-sm z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/favicon.ico" alt="omori logo" width={24} height={24} className="rounded" />
                <span className="text-lg font-semibold">omori</span>
              </div>
              <button
                onClick={() => signIn("google")}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#2a2a2a] text-foreground rounded-lg hover:bg-[#353535] transition-colors font-medium"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign In
              </button>
            </div>
          </header>

          {/* Hero Section - Centered */}
          <main className="min-h-[100dvh] flex items-center justify-center px-6">
            <div className="text-center max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Your diary, smarter.
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                A minimalistic diary app with intelligent search, Notion integration, and smart recommendations to help you discover meaningful connections in your thoughts.
              </p>
              <button
                onClick={() => signIn("google")}
                className="inline-flex items-center gap-3 px-6 py-3 text-base bg-[#2a2a2a] text-foreground rounded-lg hover:bg-[#353535] transition-colors font-medium"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Get Started with Google
              </button>
            </div>
          </main>

          {/* Benefits Section - Appears on scroll */}
          <div
            className={`transition-opacity duration-500 ${
              showBenefits ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="max-w-4xl mx-auto px-6 pb-20">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[#2a2a2a] flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
                  <p className="text-gray-400 text-sm">
                    Find old entries using embedding-based search. Discover connections you didn&apos;t know existed.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[#2a2a2a] flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Notion Sync</h3>
                  <p className="text-gray-400 text-sm">
                    Import and export diary entries. Keep everything in sync between Omori and Notion.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[#2a2a2a] flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Smart Recommendations</h3>
                  <p className="text-gray-400 text-sm">
                    Get similarity recommendations to explore related thoughts and entries.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Image src="/favicon.ico" alt="omori logo" width={20} height={20} className="rounded" />
                  <span>© {new Date().getFullYear()} Omori Cloud</span>
                </div>
                <div className="flex items-center gap-6">
                  <Link href="/privacy" className="hover:text-gray-300 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-gray-300 transition-colors">
                    Terms of Use
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
}

