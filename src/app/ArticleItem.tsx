"use client";

import { Loader2, FileText } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { SearchResult } from "./useSearch";

export type ArticleListItem = Omit<SearchResult, "_score"> & {
  _score?: number;
};

type ArticleItemProps = {
  article: ArticleListItem;
  isPending: boolean;
  onSelect: () => void;
  showScore: boolean;
};

export function ArticleItem({ article, isPending, onSelect, showScore }: ArticleItemProps) {
  const IconComponent =
    article.icon &&
    ((LucideIcons as Record<string, unknown>)[article.icon] as typeof FileText | undefined);
  const Icon = (IconComponent ?? FileText) as typeof FileText;
  const displayDate = article.createdAt;

  return (
    <button
      onClick={onSelect}
      disabled={isPending}
      className={`w-full flex items-center gap-3.5 px-5 py-1.5 hover:bg-hover cursor-pointer rounded-3xl text-left transition-all duration-150 disabled:cursor-wait ${
        isPending ? "bg-hover/80 opacity-70 scale-[0.90]" : "disabled:opacity-50"
      }`}
    >
      <span className="flex-shrink-0 text-gray-400">
        {isPending ? <Loader2 size={24} className="animate-spin" /> : <Icon size={24} />}
      </span>
      <span className="text-base truncate min-w-0 flex-1">{article.title}</span>
      <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0 flex items-center gap-3.5">
        {showScore && (
          <span className="text-xs font-mono text-gray-400">
            {((article._score ?? 0) * 100).toFixed(1)}%
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
}

