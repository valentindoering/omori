"use client";

import { UserMenu } from "@/components/UserMenu";
import { Brand } from "@/components/Brand";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useSearch } from "./useSearch";
import { SearchControls } from "./SearchControls";
import { ArticleItem, type ArticleListItem } from "./ArticleItem";

export default function ArticleList() {
  const router = useRouter();
  const createArticle = useMutation(api.articles.createArticle);
  const {
    state,
    dispatch,
    titleSearchQuery,
    isEmbedSearching,
    isTitleSearching,
  } = useSearch();
  const [clickedArticleId, setClickedArticleId] = useState<string | null>(null);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const previousResultsRef = useRef<Array<ArticleListItem>>([]);

  // Use regular paginated query - simple and straightforward
  const { results: searchArticles, status: searchStatus, loadMore: searchLoadMore } = usePaginatedQuery(
    api.articles.listArticles,
    { search: titleSearchQuery },
    { 
      initialNumItems: 20
    }
  );

  // Determine which results to show (including embed search results)
  const results = isEmbedSearching
    ? state.embedResults 
    : searchArticles;
  const status = isEmbedSearching
    ? (state.embedLoading ? "LoadingFirstPage" : "CanLoadMore")
    : searchStatus;

  // Keep previous results visible during loading to avoid flicker
  if (results.length > 0) {
    previousResultsRef.current = results;
  } else if (status !== "LoadingFirstPage") {
    previousResultsRef.current = [];
  }
  const displayResults = results.length === 0 && status === "LoadingFirstPage" && previousResultsRef.current.length > 0
    ? previousResultsRef.current
    : results;

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
    if (bottom && status === "CanLoadMore") void searchLoadMore(10);
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-x-hidden">
      <div className="sticky top-0 z-10 bg-background flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_14px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
              <Image src="/favicon.ico" alt="omori logo" width={22} height={22} className="rounded" />
            </div>
            <Brand variant="app" />
          </div>
          <UserMenu />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center">
              <SearchControls
                state={state}
                dispatch={dispatch}
                titleSpinner={status === "LoadingFirstPage" && isTitleSearching}
                embedSpinner={state.embedLoading && isEmbedSearching}
              />
              <button
                onClick={handleCreateArticle}
                disabled={isCreatingArticle}
                className="flex items-center gap-2 p-2.5 hover:bg-hover rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait"
                aria-label="Create article"
              >
                {isCreatingArticle ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Plus size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 flex-1 flex flex-col min-h-0 min-w-0 w-full">
        <div onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden w-full">
          {displayResults.length === 0 ? (
            status === "LoadingFirstPage" ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-base">Loading...</p>
              </div>
            ) : state.mode !== "idle" && (isTitleSearching || isEmbedSearching) ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-base">No matching articles.</p>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p className="text-base">No articles yet. Create your first one!</p>
              </div>
            )
          ) : (
            <div className="space-y-1.5 mb-20">
              {displayResults.map((article) => (
                <ArticleItem
                  key={article._id}
                  article={article}
                  isPending={clickedArticleId === article._id}
                  showScore={isEmbedSearching}
                  onSelect={() => {
                    setClickedArticleId(article._id);
                    router.push(`/article/${article._id}`);
                  }}
                />
              ))}
              
              {status === "LoadingMore" && (
                <div className="text-center py-5 text-gray-500 text-base">Loading more...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
