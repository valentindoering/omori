"use client";

import { Editor } from "@/components/Editor";
import { DeleteArticleDialog } from "@/components/DeleteArticleDialog";
import { IconPicker } from "@/components/IconPicker";
import { AIReflectionDialog, PanelPosition } from "@/components/AIReflectionDialog";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreVertical, Trash2, Check, Loader2, Sparkles, Wand2 } from "lucide-react";
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
  const generateTitleAndIcon = useAction(api.aiReflection.generateTitleAndIcon);

  const [title, setTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReflectionDialog, setShowReflectionDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [reflectionHeight, setReflectionHeight] = useState(200);
  const [panelPosition, setPanelPosition] = useState<PanelPosition>("top");
  const [isGeneratingTitleAndIcon, setIsGeneratingTitleAndIcon] = useState(false);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const editorRef = useRef<ReturnType<typeof import("@tiptap/react").useEditor> | null>(null);
  const isDeletingRef = useRef(false);
  const savedTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const autoGenerateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize position from localStorage with responsive defaults
  useEffect(() => {
    const stored = localStorage.getItem("aiReflectionPanelPosition") as PanelPosition | null;
    let initialPosition: PanelPosition | null = null;
    if (stored && ["top", "bottom", "right"].includes(stored)) {
      initialPosition = stored;
    } else {
      const isMobile = window.innerWidth < 768;
      initialPosition = isMobile ? "top" : "right";
      localStorage.setItem("aiReflectionPanelPosition", initialPosition);
    }
    if (initialPosition) {
      setPanelPosition(initialPosition);
      setReflectionHeight(initialPosition === "right" ? 320 : 200);
    }
  }, []);

  const handlePositionChange = useCallback((position: PanelPosition) => {
    setPanelPosition(position);
    localStorage.setItem("aiReflectionPanelPosition", position);
    if (position === "right") {
      setReflectionHeight(320);
    } else {
      setReflectionHeight(200);
    }
  }, []);

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
    // Clear auto-generation timer if user changes title from "Untitled"
    if (newTitle && newTitle !== "Untitled" && autoGenerateTimeoutRef.current) {
      clearTimeout(autoGenerateTimeoutRef.current);
    }
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
    if (autoGenerateTimeoutRef.current) clearTimeout(autoGenerateTimeoutRef.current);
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

  const handleGenerateTitleAndIcon = useCallback(async () => {
    setIsGeneratingTitleAndIcon(true);
    try {
      const result = await generateTitleAndIcon({ articleId });
      await Promise.all([
        updateTitle({ articleId, title: result.title }),
        updateIcon({ articleId, icon: result.icon }),
      ]);
      setTitle(result.title);
    } catch (err) {
      console.error("Failed to generate title and icon:", err);
    } finally {
      setIsGeneratingTitleAndIcon(false);
    }
  }, [articleId, generateTitleAndIcon, updateTitle, updateIcon]);

  // Auto-generate title and icon after 5 minutes if title is still "Untitled"
  useEffect(() => {
    if (!articleData || articleData.title !== "Untitled" || isGeneratingTitleAndIcon) {
      return;
    }

    autoGenerateTimeoutRef.current = setTimeout(async () => {
      // Double-check title is still "Untitled" before generating
      if (!isDeletingRef.current && articleData.title === "Untitled") {
        await handleGenerateTitleAndIcon();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (autoGenerateTimeoutRef.current) {
        clearTimeout(autoGenerateTimeoutRef.current);
      }
    };
  }, [articleData, articleId, isGeneratingTitleAndIcon, handleGenerateTitleAndIcon]);

  // Keyboard navigation for focusing title and editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      
      // Escape to blur/unfocus
      if (e.key === "Escape") {
        if (activeElement instanceof HTMLElement) {
          activeElement.blur();
        }
        return;
      }

      // Arrow Down navigation
      if (e.key === "ArrowDown") {
        // Check if we're in the editor (contenteditable element)
        const isInEditor = activeElement?.getAttribute('contenteditable') === 'true' ||
                          activeElement?.closest('[contenteditable="true"]');
        
        // If in the editor, let Arrow Down work normally (line by line)
        if (isInEditor) {
          return;
        }

        // If in title, move to editor
        if (activeElement === titleInputRef.current) {
          e.preventDefault();
          editorRef.current?.commands.focus();
          return;
        }

        // If not in any text input, focus title
        const isInTextInput = 
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement;
        
        if (!isInTextInput) {
          e.preventDefault();
          titleInputRef.current?.focus();
        }
      }

      // Arrow Up from editor top -> go back to title
      if (e.key === "ArrowUp") {
        const isInEditor = activeElement?.getAttribute('contenteditable') === 'true' ||
                          activeElement?.closest('[contenteditable="true"]');
        
        if (isInEditor && editorRef.current) {
          const { from, $anchor } = editorRef.current.state.selection;
          // Check if cursor is at the beginning of the first line
          // We check if we're at position 0 OR if we're in the first text block at its start
          const atStart = from <= 1 || ($anchor.parentOffset === 0 && $anchor.parent.isTextblock && $anchor.start() <= 1);
          
          if (atStart) {
            e.preventDefault();
            titleInputRef.current?.focus();
            // Move cursor to end of title
            setTimeout(() => {
              if (titleInputRef.current) {
                const length = titleInputRef.current.value.length;
                titleInputRef.current.setSelectionRange(length, length);
              }
            }, 0);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!articleData) {
    return <ArticleSkeleton />;
  }

  // Calculate content area styles based on panel position
  const getContentAreaStyle = (): React.CSSProperties => {
    if (!showReflectionDialog) {
      return {};
    }

    if (panelPosition === "right") {
      return {
        right: `${reflectionHeight}px`,
      };
    } else if (panelPosition === "bottom") {
      return {
        bottom: `${reflectionHeight}px`,
      };
    } else {
      return {
        top: `${reflectionHeight}px`,
      };
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <AIReflectionDialog
        articleId={articleId}
        isOpen={showReflectionDialog}
        onClose={() => setShowReflectionDialog(false)}
        height={reflectionHeight}
        onHeightChange={setReflectionHeight}
        position={panelPosition}
        onPositionChange={handlePositionChange}
      />
      
      <div 
        className="absolute inset-0 overflow-y-auto"
        style={getContentAreaStyle()}
      >
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
          <div className="px-8 py-4 flex justify-between items-center">
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
                      onClick={() => setShowReflectionDialog(true)}
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-100 data-focus:bg-white/10"
                    >
                      <Sparkles size={16} className="text-purple-300" />
                      AI assistant
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={handleGenerateTitleAndIcon}
                      disabled={isGeneratingTitleAndIcon}
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-100 data-focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingTitleAndIcon ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Wand2 size={16} className="text-purple-300" />
                      )}
                      Generate title & icon
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
