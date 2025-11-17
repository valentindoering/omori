"use client";

import { Editor } from "@/components/Editor";
import { DeleteArticleDialog } from "@/components/DeleteArticleDialog";
import { IconPicker } from "@/components/IconPicker";
import { AIReflectionDialog } from "@/components/AIReflectionDialog";
import { EditPromptDialog } from "@/components/EditPromptDialog";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreVertical, Trash2, Check, Loader2, Sparkles } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ArticleSkeleton } from "./ArticleSkeleton";

type SaveStatus = 'idle' | 'typing' | 'saving' | 'saved';

export default function Article({ 
  articleId 
}: { 
  articleId: Id<"articles">
}) {
  const router = useRouter();

  // Simple useQuery - no preloading needed
  const articleData = useQuery(api.articles.getArticle, { articleId });
  
  const updateTitle = useMutation(api.articles.updateTitle);
  const updateContent = useMutation(api.articles.updateContent);
  const updateIcon = useMutation(api.articles.updateIcon);
  const deleteArticle = useMutation(api.articles.deleteArticle);
  const getReflection = useAction(api.aiReflection.getArticleReflection);
  const updateAiPrompt = useMutation(api.users.updateAiPrompt);
  const userPrompt = useQuery(api.users.getAiPrompt);

  const [title, setTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReflectionDialog, setShowReflectionDialog] = useState(false);
  const [showEditPromptDialog, setShowEditPromptDialog] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [isReflectionLoading, setIsReflectionLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [reflectionHeight, setReflectionHeight] = useState(250);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const editorRef = useRef<ReturnType<typeof import("@tiptap/react").useEditor> | null>(null);
  const isDeletingRef = useRef(false);
  const savedTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reflectionIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  const loadReflection = useCallback(async (options?: { force?: boolean }) => {
    setReflectionError(null);
    if (!options?.force && reflection) return;
    setIsReflectionLoading(true);
    try {
      const result = await getReflection({ articleId });
      setReflection(result);
    } catch {
      setReflectionError(
        "Could not generate a reflection right now. Please try again in a moment.",
      );
    } finally {
      setIsReflectionLoading(false);
    }
  }, [reflection, getReflection, articleId]);

  // Auto-refresh reflection roughly once a minute while the dialog is open
  useEffect(() => {
    if (!showReflectionDialog) {
      if (reflectionIntervalRef.current) {
        clearInterval(reflectionIntervalRef.current);
        reflectionIntervalRef.current = undefined;
      }
      return;
    }

    // Immediately load (or refresh) when opening
    void loadReflection({ force: true });

    reflectionIntervalRef.current = setInterval(() => {
      void loadReflection({ force: true });
    }, 30_000);

    return () => {
      if (reflectionIntervalRef.current) {
        clearInterval(reflectionIntervalRef.current);
        reflectionIntervalRef.current = undefined;
      }
    };
  }, [showReflectionDialog, articleId, loadReflection]);

  if (!articleData) {
    return <ArticleSkeleton />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <AIReflectionDialog
        isOpen={showReflectionDialog}
        onClose={() => setShowReflectionDialog(false)}
        onReload={() => {
          void loadReflection({ force: true });
        }}
        onEditPrompt={() => setShowEditPromptDialog(true)}
        reflection={reflection}
        isLoading={isReflectionLoading}
        error={reflectionError}
        height={reflectionHeight}
        onHeightChange={setReflectionHeight}
      />
      
      <EditPromptDialog
        isOpen={showEditPromptDialog}
        onClose={() => setShowEditPromptDialog(false)}
        currentPrompt={userPrompt ?? null}
        onSave={async (prompt) => {
          await updateAiPrompt({ prompt });
          // Reload reflection with new prompt
          if (showReflectionDialog) {
            await loadReflection({ force: true });
          }
        }}
      />
      
      <div 
        className="absolute inset-0 overflow-y-auto"
        style={{ 
          top: showReflectionDialog ? `${reflectionHeight}px` : '0'
        }}
      >
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => {
              setIsNavigatingBack(true);
              router.push("/");
            }}
            disabled={isNavigatingBack}
            className={`text-gray-400 hover:text-white transition-all duration-150 disabled:cursor-wait ${
              isNavigatingBack ? "opacity-70 scale-[0.90]" : "disabled:opacity-50"
            }`}
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
              <MenuButton className="text-gray-400 hover:text-white transition-colors">
                <MoreVertical size={20} />
              </MenuButton>
              
              <MenuItems
                transition
                anchor="bottom end"
                className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm p-1 text-sm transition duration-100 ease-out [--anchor-gap:4px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 z-50"
              >
                <MenuItem>
                  <button
                    onClick={async () => {
                      setShowReflectionDialog(true);
                      await loadReflection();
                    }}
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-100 data-focus:bg-white/10"
                  >
                    <Sparkles size={16} className="text-purple-300" />
                    AI reflection
                  </button>
                </MenuItem>
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
      </div>

      <div className="max-w-4xl mx-auto min-h-screen">
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
