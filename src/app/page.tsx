"use client";

import { AuthWrapper } from "@/components/AuthWrapper";
import { UserMenu } from "@/components/UserMenu";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Plus, ChevronLeft } from "lucide-react";
import Image from "next/image";

/**
 * Main articles list page.
 * Shows all articles for the current user with infinite scroll pagination.
 */

export default function Home() {
  return (
    <AuthWrapper>
      <ArticlesList />
    </AuthWrapper>
  );
}

function ArticlesList() {
  const router = useRouter();
  const createArticle = useMutation(api.articles.createArticle);
  
  const { results, status, loadMore } = usePaginatedQuery(
    api.articles.listArticles,
    {},
    { initialNumItems: 20 }
  );

  const handleCreateArticle = async () => {
    const articleId = await createArticle();
    router.push(`/article/${articleId}`);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    
    if (bottom && status === "CanLoadMore") {
      void loadMore(10);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/favicon.ico" 
              alt="omori logo" 
              width={24} 
              height={24}
              className="rounded"
            />
            <h1 className="text-2xl font-bold mb-1">omori</h1>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2">
        {/* Create button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={handleCreateArticle}
            className="flex items-center gap-2 p-2 hover:bg-hover rounded-full transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Articles list */}
        <div
          onScroll={handleScroll}
          className="max-h-[calc(100vh-180px)] overflow-y-auto"
        >
          {results.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p>No articles yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((article) => (
                <button
                  key={article._id}
                  onClick={() => router.push(`/article/${article._id}`)}
                  className="w-full flex items-center gap-4 cursor-pointer px-4 py-0.5 hover:bg-hover rounded-3xl transition-colors text-left"
                >
                  <span className="text-base truncate min-w-0 flex-1">{article.title}</span>
                  <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                    <span className="hidden sm:inline">
                      {new Date(article._creationTime).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="sm:hidden">
                      {new Date(article._creationTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </button>
              ))}
              
              {status === "LoadingMore" && (
                <div className="text-center py-4 text-gray-500">
                  Loading more...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
