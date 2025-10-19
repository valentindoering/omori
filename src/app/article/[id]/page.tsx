"use client";

import { AuthWrapper } from "@/components/AuthWrapper";
import { Editor } from "@/components/Editor";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, MoreVertical, Trash2 } from "lucide-react";
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
  const deleteArticle = useMutation(api.articles.deleteArticle);

  const [title, setTitle] = useState("");
  const [isNewArticle, setIsNewArticle] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const titleInputRef = useRef<HTMLTextAreaElement>(null)
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const editorRef = useRef<ReturnType<typeof import("@tiptap/react").useEditor> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDeletingRef = useRef(false);

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
      // Auto-resize textarea on initial load
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.style.height = 'auto';
          titleInputRef.current.style.height = titleInputRef.current.scrollHeight + 'px';
        }
      }, 0);
    }
  }, [article, isNewArticle]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }
    titleSaveTimeoutRef.current = setTimeout(() => {
      if (!isDeletingRef.current) {
        void updateTitle({ articleId, title: newTitle || "Untitled" });
      }
    }, 1000);
  };

  const handleContentUpdate = (content: string) => {
    if (!isDeletingRef.current) {
      void updateContent({ articleId, content });
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this article?")) {
      isDeletingRef.current = true;
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }
      await deleteArticle({ articleId });
      router.push("/");
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Focus the TipTap editor
      if (editorRef.current) {
        editorRef.current.commands.focus();
      }
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div>
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <MoreVertical size={20} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#252525] rounded-lg shadow-lg py-1 z-10 border border-gray-800">
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#2a2a2a] flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete article
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="px-8 py-4">
          <textarea
            ref={titleInputRef}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            rows={1}
            className="text-4xl font-bold w-full bg-transparent border-none outline-none focus:ring-0 placeholder-gray-700 resize-none overflow-hidden"
            style={{
              minHeight: '1.2em',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          <div className="text-sm text-gray-500 mt-2">

            {new Date(article._creationTime).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Editor */}
        <Editor
          content={article.content}
          onUpdate={handleContentUpdate}
          editorRef={editorRef}
        />
      </div>
    </div>
  );
}

