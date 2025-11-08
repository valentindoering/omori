"use client";

import { UserMenu } from "@/components/UserMenu";
import { usePaginatedQuery, useMutation, useAction } from "convex/react";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Plus, FileText, Search, SearchCheck } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Image from "next/image";
import { useEffect, useReducer } from "react";
import { SearchControl } from "@/components/SearchControl";

type SearchResult = {
  _id: Id<"articles">;
  _creationTime: number;
  createdAt: number;
  title: string;
  userId: Id<"users">;
  icon?: string;
  hasEmbedding: boolean;
  _score: number;
};

type SearchMode = "idle" | "title" | "embed";

type SearchState = {
  mode: SearchMode;
  titleQuery: string;
  debouncedTitleQuery: string;
  embedQuery: string;
  debouncedEmbedQuery: string;
  embedResults: SearchResult[];
  embedLoading: boolean;
};

type SearchAction =
  | { type: "TOGGLE_TITLE" }
  | { type: "TOGGLE_EMBED" }
  | { type: "UPDATE_TITLE_QUERY"; query: string }
  | { type: "UPDATE_EMBED_QUERY"; query: string }
  | { type: "SET_DEBOUNCED_TITLE"; query: string }
  | { type: "SET_DEBOUNCED_EMBED"; query: string }
  | { type: "CLEAR_TITLE" }
  | { type: "CLEAR_EMBED" }
  | { type: "EMBED_LOADING" }
  | { type: "EMBED_SUCCESS"; results: SearchResult[] }
  | { type: "EMBED_ERROR" };

const initialSearchState: SearchState = {
  mode: "idle",
  titleQuery: "",
  debouncedTitleQuery: "",
  embedQuery: "",
  debouncedEmbedQuery: "",
  embedResults: [],
  embedLoading: false,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "TOGGLE_TITLE":
      if (state.mode === "title") {
        return initialSearchState;
      }
      return {
        ...initialSearchState,
        mode: "title",
      };

    case "TOGGLE_EMBED":
      if (state.mode === "embed") {
        return initialSearchState;
      }
      return {
        ...initialSearchState,
        mode: "embed",
      };

    case "UPDATE_TITLE_QUERY":
      return { ...state, titleQuery: action.query };

    case "UPDATE_EMBED_QUERY":
      return { ...state, embedQuery: action.query };

    case "SET_DEBOUNCED_TITLE":
      return { ...state, debouncedTitleQuery: action.query };

    case "SET_DEBOUNCED_EMBED":
      return { ...state, debouncedEmbedQuery: action.query };

    case "CLEAR_TITLE":
      return {
        ...state,
        mode: "idle",
        titleQuery: "",
        debouncedTitleQuery: "",
      };

    case "CLEAR_EMBED":
      return {
        ...state,
        mode: "idle",
        embedQuery: "",
        debouncedEmbedQuery: "",
        embedResults: [],
        embedLoading: false,
      };

    case "EMBED_LOADING":
      return { ...state, embedLoading: true };

    case "EMBED_SUCCESS":
      return {
        ...state,
        embedResults: action.results,
        embedLoading: false,
      };

    case "EMBED_ERROR":
      return {
        ...state,
        embedResults: [],
        embedLoading: false,
      };

    default:
      return state;
  }
}

export default function ArticleList({ 
  preloadedArticles 
}: { 
  preloadedArticles: Preloaded<typeof api.articles.listArticles> 
}) {
  const router = useRouter();
  const createArticle = useMutation(api.articles.createArticle);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchByEmbedding = useAction((api.embeddings as any).searchByEmbedding);

  const [state, dispatch] = useReducer(searchReducer, initialSearchState);

  // Debounce title query
  useEffect(() => {
    const id = setTimeout(
      () => dispatch({ type: "SET_DEBOUNCED_TITLE", query: state.titleQuery.trim() }),
      250
    );
    return () => clearTimeout(id);
  }, [state.titleQuery]);

  // Debounce embed query
  useEffect(() => {
    const id = setTimeout(
      () => dispatch({ type: "SET_DEBOUNCED_EMBED", query: state.embedQuery.trim() }),
      250
    );
    return () => clearTimeout(id);
  }, [state.embedQuery]);

  // Trigger embedding search when debounced query changes
  useEffect(() => {
    if (state.mode === "embed" && state.debouncedEmbedQuery) {
      dispatch({ type: "EMBED_LOADING" });
      searchByEmbedding({ query: state.debouncedEmbedQuery })
        .then((res) => dispatch({ type: "EMBED_SUCCESS", results: res }))
        .catch(() => dispatch({ type: "EMBED_ERROR" }));
    }
  }, [state.debouncedEmbedQuery, state.mode, searchByEmbedding]);

  // Use preloaded query when in idle mode (no search), otherwise use regular paginated query
  const initialArticles = usePreloadedQuery(preloadedArticles);
  const { results: searchArticles, status: searchStatus, loadMore: searchLoadMore } = usePaginatedQuery(
    api.articles.listArticles,
    { search: state.mode === "title" && state.debouncedTitleQuery ? state.debouncedTitleQuery : undefined },
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
              isOpen={state.mode === "title"}
              onToggle={() => dispatch({ type: "TOGGLE_TITLE" })}
              query={state.titleQuery}
              setQuery={(query) => dispatch({ type: "UPDATE_TITLE_QUERY", query })}
              onClear={() => dispatch({ type: "CLEAR_TITLE" })}
              placeholder="Title search"
              showSpinner={status === "LoadingFirstPage" && state.mode === "title" && state.debouncedTitleQuery !== ""}
              idleIcon={<Search size={16} />}
              ariaLabel="Toggle search"
            />

            {/* Embedding search */}
            <SearchControl
              isOpen={state.mode === "embed"}
              onToggle={() => dispatch({ type: "TOGGLE_EMBED" })}
              query={state.embedQuery}
              setQuery={(query) => dispatch({ type: "UPDATE_EMBED_QUERY", query })}
              onClear={() => dispatch({ type: "CLEAR_EMBED" })}
              placeholder="Embedding search"
              showSpinner={state.embedLoading && state.mode === "embed" && state.debouncedEmbedQuery !== ""}
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
                    onClick={() => router.push(`/article/${article._id}`)}
                    className="w-full flex items-center gap-3 px-4 py-0.5 hover:bg-hover cursor-pointer rounded-3xl transition-colors text-left"
                  >
                    <span className="flex-shrink-0 text-gray-400">
                      <IconComponent size={20} />
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
