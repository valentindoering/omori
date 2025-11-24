"use client";

import {
  Loader2,
  X,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Sidebar,
  Check,
  Trash2,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";

export type PanelPosition = "top" | "bottom" | "right";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const PRESET_PROMPT = `Read this article and offer sharp insights or questions that help the author think deeper.
Focus on the ending if relevant.
Always format your response as bullet points (using - or •).
Keep it brief - 2-4 bullet points maximum.
No emojis, no quotes, no preface.`;

interface AIReflectionDialogProps {
  articleId: Id<"articles">;
  isOpen: boolean;
  onClose: () => void;
  height: number;
  onHeightChange: (height: number) => void;
  position: PanelPosition;
  onPositionChange: (position: PanelPosition) => void;
}

export function AIReflectionDialog({
  articleId,
  isOpen,
  onClose,
  height,
  onHeightChange,
  position,
  onPositionChange,
}: AIReflectionDialogProps) {
  const sendChatMessage = useAction(api.aiReflection.chatWithArticle);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const makeMessageId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    if (position === "right") {
      dragStartX.current = e.clientX;
      dragStartWidth.current = height; // Using height as width for right sidebar
    } else {
      dragStartY.current = e.clientY;
      dragStartHeight.current = height;
    }
    e.preventDefault();
  }, [height, position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (position === "right") {
        const deltaX = dragStartX.current - e.clientX;
        const newWidth = Math.max(
          280,
          Math.min(window.innerWidth * 0.6, dragStartWidth.current + deltaX),
        );
        onHeightChange(newWidth);
      } else {
        const deltaY =
          position === "top"
            ? e.clientY - dragStartY.current
            : dragStartY.current - e.clientY;
        const newHeight = Math.max(
          160,
          Math.min(window.innerHeight * 0.8, dragStartHeight.current + deltaY),
        );
        onHeightChange(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onHeightChange, position]);

  useEffect(() => {
    setMessages([]);
    setInputValue("");
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
  }, [articleId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${Math.max(24, newHeight)}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleInsertPreset = useCallback(() => {
    setInputValue((prev) => {
      if (!prev.trim()) return PRESET_PROMPT;
      return `${prev.trim()}\n\n${PRESET_PROMPT}`;
    });
  }, []);

  const handleClearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const handleSendMessage = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;

    const userMessage: ChatMessage = {
      id: makeMessageId(),
      role: "user",
      content,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
    setIsSending(true);
    setError(null);

    try {
      const reply = await sendChatMessage({
        articleId,
        messages: nextMessages.map(({ role, content: msgContent }) => ({
          role,
          content: msgContent,
        })),
      });

      const assistantMessage: ChatMessage = {
        id: makeMessageId(),
        role: "assistant",
        content: reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setError("Could not reach the AI right now. Please try again.");
    } finally {
      setIsSending(false);
    }
  }, [articleId, inputValue, isSending, messages, sendChatMessage]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  if (!isOpen) return null;

  // Determine container classes based on position
  const getContainerClasses = () => {
    const baseClasses = "fixed z-50 bg-gradient-to-br from-purple-500/20 via-purple-500/8 to-black/60 backdrop-blur-2xl shadow-[0_22px_80px_rgba(0,0,0,0.85)] overflow-hidden";
    
    if (position === "right") {
      return `${baseClasses} top-0 right-0 bottom-0`;
    } else if (position === "bottom") {
      return `${baseClasses} bottom-0 left-0 right-0`;
    } else {
      return `${baseClasses} top-0 left-0 right-0`;
    }
  };

  const getContainerStyle = (): React.CSSProperties => {
    if (position === "right") {
      return { width: `${height}px` };
    } else {
      return { height: `${height}px` };
    }
  };

  // Determine content wrapper classes
  const getContentWrapperClasses = () => {
    if (position === "right") {
      return "h-full flex flex-col";
    } else {
      return "h-full flex flex-col";
    }
  };

  // Determine content container classes
  const getContentContainerClasses = () => {
    if (position === "right") {
      return "px-6 py-4 relative h-full";
    } else {
      return "max-w-4xl mx-auto px-8 py-4 relative";
    }
  };

  // Get resize handle position and classes
  const getResizeHandleClasses = () => {
    const baseClasses = `fixed z-50 bg-white/5 hover:bg-purple-500/40 transition-colors ${isDragging ? 'bg-purple-500/60' : ''}`;
    
    if (position === "right") {
      return `${baseClasses} top-0 bottom-0 w-1 cursor-ew-resize`;
    } else if (position === "bottom") {
      return `${baseClasses} left-0 right-0 h-1 cursor-ns-resize`;
    } else {
      return `${baseClasses} left-0 right-0 h-1 cursor-ns-resize`;
    }
  };

  const getResizeHandleStyle = (): React.CSSProperties => {
    if (position === "right") {
      return { right: `${height}px` };
    } else if (position === "bottom") {
      return { bottom: `${height}px` };
    } else {
      return { top: `${height}px` };
    }
  };

  return (
    <>
      <div 
        className={getContainerClasses()}
        style={getContainerStyle()}
      >
        <div className={getContentWrapperClasses()}>
          <div className="flex-1 overflow-hidden">
            <div className={`${getContentContainerClasses()} flex flex-col h-full`}>
              {/* Menu Button - Top Right */}
              <div className={`absolute ${position === "right" ? "top-4 right-4" : "top-4 right-8"} z-10`}>
                <Menu>
                  <MenuButton className="text-gray-300 hover:text-white transition-colors">
                    <MoreVertical size={20} />
                  </MenuButton>

                  <MenuItems
                    transition
                    anchor="bottom end"
                    className="w-56 origin-top-right rounded-2xl border border-white/5 bg-black/60 backdrop-blur-xl p-1 text-sm transition duration-100 ease-out [--anchor-gap:6px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 z-[60]"
                  >
                    <MenuItem>
                      <button
                        onClick={handleClearConversation}
                        className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-gray-100 data-focus:bg-white/10"
                      >
                        <Trash2 size={16} />
                        Clear conversation
                      </button>
                    </MenuItem>
                    <div className="my-1 h-px bg-white/10" />
                    <MenuItem>
                      <button
                        onClick={() => onPositionChange("top")}
                        className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-gray-100 data-focus:bg-white/10 ${position === "top" ? "bg-white/10" : ""}`}
                      >
                        <ArrowUp size={16} />
                        Dock top
                        {position === "top" && <Check size={14} className="ml-auto" />}
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => onPositionChange("bottom")}
                        className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-gray-100 data-focus:bg-white/10 ${position === "bottom" ? "bg-white/10" : ""}`}
                      >
                        <ArrowDown size={16} />
                        Dock bottom
                        {position === "bottom" && <Check size={14} className="ml-auto" />}
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => onPositionChange("right")}
                        className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-gray-100 data-focus:bg-white/10 ${position === "right" ? "bg-white/10" : ""}`}
                      >
                        <Sidebar size={16} />
                        Dock right
                        {position === "right" && <Check size={14} className="ml-auto" />}
                      </button>
                    </MenuItem>
                    <div className="my-1 h-px bg-white/10" />
                    <MenuItem>
                      <button
                        onClick={onClose}
                        className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-gray-100 data-focus:bg-white/10"
                      >
                        <X size={16} />
                        Close panel
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>

              {/* Conversation */}
              <div className="mt-10 flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-5">
                  {messages.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm text-white/70">
                      Share what you’re trying to refine, describe how the piece should feel, or paste new lines to workshop.
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] text-sm leading-relaxed ${
                          message.role === "user"
                            ? "rounded-2xl bg-white/80 px-4 py-3 text-gray-900 shadow-sm"
                            : "text-white/90"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            className="space-y-2 text-white/90"
                            components={{
                              p: ({ children }) => (
                                <p className="text-sm leading-relaxed last:mb-0">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc space-y-1 pl-5 text-sm">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal space-y-1 pl-5 text-sm">{children}</ol>
                              ),
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              strong: ({ children }) => <strong className="text-white">{children}</strong>,
                              em: ({ children }) => <em className="text-white/80">{children}</em>,
                              code: ({ children }) => (
                                <code className="rounded bg-white/10 px-1 py-0.5 text-[0.8rem] text-white">
                                  {children}
                                </code>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Loader2 size={14} className="animate-spin" />
                      Thinking…
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleInsertPreset}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 transition"
                >
                  Use preset
                </button>
                
                <div className={`flex items-end gap-2 rounded-2xl border border-white/10 bg-black/25 backdrop-blur-xl p-3 ${position === "right" ? "pr-4" : "pr-6"}`}>
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask something specific, shift+enter for a new line."
                    className="flex-1 resize-none bg-transparent text-sm text-white placeholder-white/40 focus:outline-none leading-6"
                    style={{ minHeight: '24px', maxHeight: '200px', height: '24px' }}
                  />
                  
                  <button
                    onClick={() => void handleSendMessage()}
                    disabled={!inputValue.trim() || isSending}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-gray-900 transition hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ArrowUp size={14} />
                    )}
                  </button>
                </div>

                {error && <p className="text-xs text-red-300">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resize Handle */}
      <div
        className={getResizeHandleClasses()}
        style={getResizeHandleStyle()}
        onMouseDown={handleMouseDown}
      >
        {position === "right" ? (
          <div className="absolute inset-0 -left-2 -right-2" />
        ) : (
          <div className="absolute inset-0 -top-2 -bottom-2" />
        )}
      </div>
    </>
  );
}


