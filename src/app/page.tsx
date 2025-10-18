"use client";

import { AuthWrapper } from "@/components/AuthWrapper";
import { UserMenu } from "@/components/UserMenu";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";

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
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Omori</h1>
          <UserMenu />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Create button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleCreateArticle}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>New Article</span>
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
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-900 rounded-lg transition-colors text-left"
                >
                  <span className="text-lg">{article.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(article._creationTime).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
