"use client";

import { UserMenu } from "@/components/UserMenu";
import { usePaginatedQuery, useMutation } from "convex/react";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearch } from "./useSearch";
import { SearchControls } from "./SearchControls";
import type { SearchResult } from "./useSearch";

export default function ArticleList({ 
  preloadedArticles 
}: { 
  preloadedArticles: Preloaded<typeof api.articles.listArticles> 
}) {
  const router = useRouter();
  const createArticle = useMutation(api.articles.createArticle);
  const { state, dispatch, titleSearchQuery } = useSearch();
  const [clickedArticleId, setClickedArticleId] = useState<string | null>(null);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);

  // Use preloaded query when in idle mode (no search), otherwise use regular paginated query
  const initialArticles = usePreloadedQuery(preloadedArticles);
  const { results: searchArticles, status: searchStatus, loadMore: searchLoadMore } = usePaginatedQuery(
    api.articles.listArticles,
    { search: titleSearchQuery },
    { 
      initialNumItems: 20
    }
  );

  // Determine which results to show - use preloaded data when idle, otherwise use paginated query results
  const allArticles = (state.mode === "idle" && !state.debouncedTitleQuery) 
    ? initialArticles.page 
    : searchArticles;
  const articlesStatus = (state.mode === "idle" && !state.debouncedTitleQuery)
    ? (initialArticles.isDone ? "Exhausted" : "CanLoadMore")
    : searchStatus;
  // For loadMore, if we're using preloaded data, we need to switch to paginated query
  // So we'll always use paginated query but skip it initially when we have preloaded data
  const loadMore = searchLoadMore;

  // Determine which results to show (including embed search results)
  const results = state.mode === "embed" && state.debouncedEmbedQuery 
    ? state.embedResults 
    : allArticles;
  const status = state.mode === "embed" && state.debouncedEmbedQuery
    ? (state.embedLoading ? "LoadingFirstPage" : "CanLoadMore")
    : articlesStatus;

  const handleCreateArticle = async () => {
    setIsCreatingArticle(true);
    const articleId = await createArticle();
    setIsCreatingArticle(false);
    setClickedArticleId(articleId);
    router.push(`/article/${articleId}`);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    if (bottom && status === "CanLoadMore") void loadMore(10);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/favicon.ico" alt="omori logo" width={24} height={24} className="rounded" />
          <h1 className="text-2xl font-bold mb-1">omori</h1>
        </div>
        <UserMenu />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-2">
        <div className="flex items-center justify-end mb-2">
          <div className="flex items-center">
            <SearchControls state={state} dispatch={dispatch} status={status} />
            <button
              onClick={handleCreateArticle}
              disabled={isCreatingArticle}
              className="flex items-center gap-2 p-2 hover:bg-hover rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait"
              aria-label="Create article"
            >
              {isCreatingArticle ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
            </button>
          </div>
        </div>

        <div onScroll={handleScroll} className="max-h-[calc(100vh-180px)] overflow-y-auto">
          {results.length === 0 ? (
            status === "LoadingFirstPage" ? (
              null
            ) : state.mode !== "idle" && (state.debouncedTitleQuery || state.debouncedEmbedQuery) ? (
              <div className="text-center py-16 text-gray-500">
                <p>No matching articles.</p>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <p>No articles yet. Create your first one!</p>
              </div>
            )
          ) : (
            <div className="space-y-1">
              {results.map((article) => {
                const IconComponent = article.icon 
                  ? ((LucideIcons as Record<string, unknown>)[article.icon] as typeof FileText || FileText)
                  : FileText;
                
                // Use createdAt for display
                const displayDate = article.createdAt;
                
                return (
                  <button
                    key={article._id}
                    onClick={() => {
                      setClickedArticleId(article._id);
                      router.push(`/article/${article._id}`);
                    }}
                    disabled={clickedArticleId === article._id}
                    className="w-full flex items-center gap-3 px-4 py-0.5 hover:bg-hover cursor-pointer rounded-3xl transition-colors text-left disabled:opacity-50 disabled:cursor-wait"
                  >
                    <span className="flex-shrink-0 text-gray-400">
                      {clickedArticleId === article._id ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <IconComponent size={20} />
                      )}
                    </span>
                    <span className="text-base truncate min-w-0 flex-1">{article.title}</span>
                    <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0 flex items-center gap-3">
                      {state.mode === "embed" && state.debouncedEmbedQuery && "_score" in article && (
                        <span className="text-xs font-mono text-gray-400">
                          {(article._score * 100).toFixed(1)}%
                        </span>
                      )}
                      <span className="hidden sm:inline">
                        {new Date(displayDate).toLocaleDateString("en-US", {
                          year: "2-digit",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="sm:hidden">
                        {new Date(displayDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          article.hasEmbedding ? "bg-gray-400" : "bg-gray-700"
                        }`}
                        title={article.hasEmbedding ? "Embedding ready" : "No embedding yet"}
                      />
                    </span>
                  </button>
                );
              })}
              
              {status === "LoadingMore" && (
                <div className="text-center py-4 text-gray-500">Loading more...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
