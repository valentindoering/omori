"use client";

import { Editor } from "@/components/Editor";
import { DeleteArticleDialog } from "@/components/DeleteArticleDialog";
import { IconPicker } from "@/components/IconPicker";
import { useMutation, Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, MoreVertical, Trash2, Check, Loader2 } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

type SaveStatus = 'idle' | 'typing' | 'saving' | 'saved';

export default function Article({ 
  preloadedArticle 
}: { 
  preloadedArticle: Preloaded<typeof api.articles.getArticle> 
}) {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as Id<"articles">;

  // Preloaded query is reactive (like useQuery) and will stay up to date.
  const articleData = usePreloadedQuery(preloadedArticle);
  
  const updateTitle = useMutation(api.articles.updateTitle);
  const updateContent = useMutation(api.articles.updateContent);
  const updateIcon = useMutation(api.articles.updateIcon);
  const deleteArticle = useMutation(api.articles.deleteArticle);

  const [title, setTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const editorRef = useRef<ReturnType<typeof import("@tiptap/react").useEditor> | null>(null);
  const isDeletingRef = useRef(false);
  const savedTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (articleData) {
      setTitle(articleData.title);
      if (articleData.title === "Untitled") {
        setTimeout(() => titleInputRef.current?.select(), 100);
      }
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.style.height = 'auto';
          titleInputRef.current.style.height = titleInputRef.current.scrollHeight + 'px';
        }
      }, 0);
    }
  }, [articleData]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSaveStatus('typing');
    if (titleSaveTimeoutRef.current) clearTimeout(titleSaveTimeoutRef.current);
    titleSaveTimeoutRef.current = setTimeout(async () => {
      if (!isDeletingRef.current) {
        setSaveStatus('saving');
        await updateTitle({ articleId, title: newTitle || "Untitled" });
        setSaveStatus('saved');
      }
    }, 1000);
  };

  const handleContentUpdate = async (content: string) => {
    if (!isDeletingRef.current) {
      await updateContent({ articleId, content });
      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      // savedTimeoutRef.current = setTimeout(() => {
      //   setSaveStatus('idle');
      // }, 2000);
    }
  };

  const handleStatusChange = (status: SaveStatus) => {
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    setSaveStatus(status);
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

  const handleIconChange = async (iconName: string) => {
    await updateIcon({ articleId, icon: iconName });
  };

  if (!articleData) {
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
          onClick={() => {
            setIsNavigatingBack(true);
            router.push("/");
          }}
          disabled={isNavigatingBack}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {isNavigatingBack ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <ChevronLeft size={24} />
          )}
        </button>
        
        <div className="flex items-center gap-4">
          <SaveIndicator status={saveStatus} />
          
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
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="px-8 py-4 space-y-1">
          <div className="mb-2">
            <IconPicker currentIcon={articleData.icon} onSelect={handleIconChange} />
          </div>
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
            {new Date(articleData.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        </div>

        <Editor
          content={articleData.content}
          onUpdate={handleContentUpdate}
          onStatusChange={handleStatusChange}
          editorRef={editorRef}
        />
      </div>

      <DeleteArticleDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        articleTitle={articleData.title !== "Untitled" ? `"${articleData.title}"` : "this article"}
      />
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;

  return (
    <div className="flex items-center">
      {status === 'typing' && (
        <div className="w-2 h-2 rounded-full bg-gray-500" />
      )}
      {status === 'saving' && (
        <Loader2 size={16} className="animate-spin text-gray-400" />
      )}
      {status === 'saved' && (
        <Check size={16} className="text-gray-400" />
      )}
    </div>
  );
}
