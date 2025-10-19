"use client";

import { AuthWrapper } from "@/components/AuthWrapper";
import { Editor } from "@/components/Editor";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, MoreVertical, Trash2 } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const editorRef = useRef<ReturnType<typeof import("@tiptap/react").useEditor> | null>(null);
  const isDeletingRef = useRef(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      if (article.title === "Untitled") {
        setTimeout(() => titleInputRef.current?.select(), 100);
      }
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.style.height = 'auto';
          titleInputRef.current.style.height = titleInputRef.current.scrollHeight + 'px';
        }
      }, 0);
    }
  }, [article]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (titleSaveTimeoutRef.current) clearTimeout(titleSaveTimeoutRef.current);
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
    isDeletingRef.current = true;
    if (titleSaveTimeoutRef.current) clearTimeout(titleSaveTimeoutRef.current);
    await deleteArticle({ articleId });
    router.push("/");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editorRef.current?.commands.focus();
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
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push("/")}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        
        <Menu>
          <MenuButton className="text-gray-400 hover:text-white transition-colors p-1 rounded-md">
            <MoreVertical size={20} />
          </MenuButton>
          
          <MenuItems
            transition
            anchor="bottom end"
            className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm p-1 text-sm transition duration-100 ease-out [--anchor-gap:4px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 z-50"
          >
            <MenuItem>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-red-400 data-focus:bg-white/10"
              >
                <Trash2 size={16} />
                Delete article
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="px-8 py-4 space-y-1">
          <textarea
            ref={titleInputRef}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            rows={1}
            className="text-4xl font-bold w-full bg-transparent border-none outline-none focus:ring-0 placeholder-gray-700 resize-none overflow-hidden"
            style={{ minHeight: '1.2em' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          <div className="text-sm text-gray-500">
            {new Date(article._creationTime).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        </div>

        <Editor
          content={article.content}
          onUpdate={handleContentUpdate}
          editorRef={editorRef}
        />
      </div>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-[#252525] rounded-lg p-6 max-w-sm border border-gray-700">
            <DialogTitle className="text-lg font-semibold text-white mb-2">
              Delete article
            </DialogTitle>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-sm text-white hover:bg-hover rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

