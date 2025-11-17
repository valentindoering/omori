export function ArticleListSkeleton() {
  return (
    <div className="space-y-1.5 mb-20 pt-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="w-full flex items-center gap-3.5 px-5 py-2 rounded-3xl"
        >
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`h-3 mb-2 bg-white/5 rounded-full animate-pulse ${
                i % 3 === 0 ? "w-9/12" : i % 3 === 1 ? "w-10/12" : "w-8/12"
              }`}
            />
            <div className="h-3 w-3/12 bg-white/5 rounded-full animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0 ml-4">
            <div className="h-3 w-16 bg-white/5 rounded-full animate-pulse" />
            <div className="h-2 w-10 bg-white/5 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}


