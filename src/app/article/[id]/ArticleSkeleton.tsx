"use client";

import { ChevronLeft, Loader2, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

export function ArticleSkeleton() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition-all duration-150"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex items-center gap-4">
            <Loader2 size={20} className="animate-spin text-gray-500" />
            <div className="text-gray-500">
              <MoreVertical size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="px-8 py-4 space-y-1">
          <div className="mb-2">
            <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-3/4 bg-white/5 rounded-lg animate-pulse mb-2" />
          <div className="h-3 w-40 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="px-8 pb-10 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div
                className={`h-3 bg-white/5 rounded-lg animate-pulse ${
                  i % 3 === 0 ? "w-11/12" : i % 3 === 1 ? "w-10/12" : "w-9/12"
                }`}
              />
              <div
                className={`h-3 bg-white/5 rounded-lg animate-pulse ${
                  i % 2 === 0 ? "w-7/12" : "w-8/12"
                }`}
              />
              <div
                className={`h-3 bg-white/5 rounded-lg animate-pulse ${
                  i % 3 === 0 ? "w-5/12" : "w-6/12"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


