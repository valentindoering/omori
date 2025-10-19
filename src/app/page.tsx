"use client";

import { AuthWrapper } from "@/components/AuthWrapper";
import { UserMenu } from "@/components/UserMenu";
import { usePaginatedQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, FileText, Search, SearchCheck, Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SearchControl } from "@/components/SearchControl";

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
  const searchByEmbedding = useAction((api.embeddings as any).searchByEmbedding);

  // Title search state
  const [titleSearchQuery, setTitleSearchQuery] = useState("");
  const [debouncedTitleSearch, setDebouncedTitleSearch] = useState("");
  const [isTitleSearchOpen, setIsTitleSearchOpen] = useState(false);

  // Embedding search state
  const [embedSearchQuery, setEmbedSearchQuery] = useState("");
  const [debouncedEmbedSearch, setDebouncedEmbedSearch] = useState("");
  const [isEmbedSearchOpen, setIsEmbedSearchOpen] = useState(false);
  const [embedResults, setEmbedResults] = useState<any[]>([]);
  const [embedLoading, setEmbedLoading] = useState(false);

  // Input focus handled in SearchControl

  useEffect(() => {
    const id = setTimeout(() => setDebouncedTitleSearch(titleSearchQuery.trim()), 250);
    return () => clearTimeout(id);
  }, [titleSearchQuery]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedEmbedSearch(embedSearchQuery.trim()), 250);
    return () => clearTimeout(id);
  }, [embedSearchQuery]);

  // Trigger embedding search when debounced query changes (only when there's a query)
  useEffect(() => {
    if (isEmbedSearchOpen && debouncedEmbedSearch) {
      setEmbedLoading(true);
      searchByEmbedding({ query: debouncedEmbedSearch })
        .then((res) => {
          setEmbedResults(res);
          setEmbedLoading(false);
        })
        .catch(() => {
          setEmbedResults([]);
          setEmbedLoading(false);
        });
    }
  }, [debouncedEmbedSearch, isEmbedSearchOpen, searchByEmbedding]);

  // Always load articles via paginated query (for default view and title search)
  const { results: allArticles, status: articlesStatus, loadMore } = usePaginatedQuery(
    api.articles.listArticles,
    { search: isTitleSearchOpen && debouncedTitleSearch ? debouncedTitleSearch : undefined },
    { initialNumItems: 20 }
  );

  // Determine which results to show
  // - If embed search is open AND has a query, show embed results
  // - Otherwise, show paginated articles (default or title search)
  const results = (isEmbedSearchOpen && debouncedEmbedSearch) ? embedResults : allArticles;
  const status = (isEmbedSearchOpen && debouncedEmbedSearch)
    ? (embedLoading ? "LoadingFirstPage" : "CanLoadMore") 
    : articlesStatus;

  const handleCreateArticle = async () => {
    const articleId = await createArticle();
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
          {/* Controls cluster: title search, embed search, plus button */}
          <div className="flex items-center">
            <SearchControl
              isOpen={isTitleSearchOpen}
              onToggle={() => {
                setIsTitleSearchOpen((prev) => {
                  const next = !prev;
                  if (next) {
                    setIsEmbedSearchOpen(false);
                    setEmbedSearchQuery("");
                    setDebouncedEmbedSearch("");
                  }
                  return next;
                });
              }}
              query={titleSearchQuery}
              setQuery={setTitleSearchQuery}
              onClear={() => {
                setTitleSearchQuery("");
                setDebouncedTitleSearch("");
                setIsTitleSearchOpen(false);
              }}
              placeholder="Title search"
              showSpinner={status === "LoadingFirstPage" && isTitleSearchOpen && debouncedTitleSearch !== ""}
              idleIcon={<Search size={16} />}
              ariaLabel="Toggle search"
            />

            {/* Embedding search */}
            <SearchControl
              isOpen={isEmbedSearchOpen}
              onToggle={() => {
                setIsEmbedSearchOpen((prev) => {
                  const next = !prev;
                  if (next) {
                    setIsTitleSearchOpen(false);
                    setTitleSearchQuery("");
                    setDebouncedTitleSearch("");
                  }
                  return next;
                });
              }}
              query={embedSearchQuery}
              setQuery={setEmbedSearchQuery}
              onClear={() => {
                setEmbedSearchQuery("");
                setDebouncedEmbedSearch("");
                setIsEmbedSearchOpen(false);
                setEmbedResults([]);
              }}
              placeholder="Embedding search"
              showSpinner={embedLoading && isEmbedSearchOpen && debouncedEmbedSearch !== ""}
              idleIcon={<SearchCheck size={16} />}
              ariaLabel="Toggle embedding search"
            />

            <button
              onClick={handleCreateArticle}
              className="flex items-center gap-2 p-2 hover:bg-hover rounded-full transition-colors"
              aria-label="Create article"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div onScroll={handleScroll} className="max-h-[calc(100vh-180px)] overflow-y-auto">
          {results.length === 0 ? (
            status === "LoadingFirstPage" ? (
              null
            ) : (isTitleSearchOpen && debouncedTitleSearch) || (isEmbedSearchOpen && debouncedEmbedSearch) ? (
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
                    onClick={() => router.push(`/article/${article._id}`)}
                    className="w-full flex items-center gap-3 px-4 py-0.5 hover:bg-hover cursor-pointer rounded-3xl transition-colors text-left"
                  >
                    <span className="flex-shrink-0 text-gray-400">
                      <IconComponent size={20} />
                    </span>
                    <span className="text-base truncate min-w-0 flex-1">{article.title}</span>
                    <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0 flex items-center gap-3">
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
