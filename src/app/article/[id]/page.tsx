"use client";

import { AuthWrapper } from "@/components/AuthWrapper";
import { Editor } from "@/components/Editor";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";

/**
 * Article editor page.
 * Shows the article title (editable) and TipTap editor for content.
 * Includes auto-save for both title and content.
 */

export default function ArticlePage() {
  return (
    <AuthWrapper>
      <ArticleEditor />
    </AuthWrapper>
  );
}

function ArticleEditor() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as Id<"articles">;

  const article = useQuery(api.articles.getArticle, { articleId });
  const updateTitle = useMutation(api.articles.updateTitle);
  const updateContent = useMutation(api.articles.updateContent);

  const [title, setTitle] = useState("");
  const [isNewArticle, setIsNewArticle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize title when article loads
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      // If article is "Untitled", select the title for editing
      if (article.title === "Untitled" && !isNewArticle) {
        setIsNewArticle(true);
        setTimeout(() => {
          titleInputRef.current?.select();
        }, 100);
      }
    }
  }, [article, isNewArticle]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);

    // Clear existing timeout
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }

    // Save after 1 second of no typing
    titleSaveTimeoutRef.current = setTimeout(() => {
      void updateTitle({ articleId, title: newTitle || "Untitled" });
    }, 1000);
  };

  const handleContentUpdate = (content: string) => {
    void updateContent({ articleId, content });
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="px-16 pt-12 pb-4">
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="text-4xl font-bold w-full bg-transparent border-none outline-none focus:ring-0 placeholder-gray-700"
          />
          <div className="text-sm text-gray-500 mt-2">
            {new Date(article._creationTime).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Editor */}
        <Editor content={article.content} onUpdate={handleContentUpdate} />
      </div>
    </div>
  );
}

