import Image from "next/image";

function ArticleSkeleton() {
  return (
    <div className="w-full flex items-center gap-3.5 px-5 py-1.5 rounded-3xl">
      <div className="w-6 h-6 bg-gray-800 rounded animate-pulse flex-shrink-0" />
      <div className="h-5 w-2/3 bg-gray-800 rounded animate-pulse flex-1" />
      <div className="flex items-center gap-3.5 flex-shrink-0">
        <div className="h-4 w-20 bg-gray-800 rounded animate-pulse hidden sm:block" />
        <div className="h-4 w-12 bg-gray-800 rounded animate-pulse sm:hidden" />
        <div className="w-1.5 h-1.5 bg-gray-800 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/favicon.ico" alt="omori logo" width={28} height={28} className="rounded" />
          <h1 className="text-3xl font-bold mb-1">omori</h1>
        </div>
        <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3">
        <div className="flex items-center justify-end mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
          <div className="space-y-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
