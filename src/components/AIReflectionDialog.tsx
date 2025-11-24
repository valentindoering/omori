import { Loader2, X, RotateCcw, Settings, MoreVertical, ArrowUp, ArrowDown, Sidebar, Check } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export type PanelPosition = "top" | "bottom" | "right";

interface AIReflectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
  onEditPrompt: () => void;
  reflection: string | null;
  isLoading: boolean;
  error: string | null;
  height: number;
  onHeightChange: (height: number) => void;
  position: PanelPosition;
  onPositionChange: (position: PanelPosition) => void;
}

export function AIReflectionDialog({
  isOpen,
  onClose,
  onReload,
  onEditPrompt,
  reflection,
  isLoading,
  error,
  height,
  onHeightChange,
  position,
  onPositionChange,
}: AIReflectionDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

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
        const deltaX = dragStartX.current - e.clientX; // Inverted for right side
        const newWidth = Math.max(300, Math.min(window.innerWidth * 0.5, dragStartWidth.current + deltaX));
        onHeightChange(newWidth);
      } else {
        const deltaY = position === "top" 
          ? e.clientY - dragStartY.current 
          : dragStartY.current - e.clientY; // Inverted for bottom
        const newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, dragStartHeight.current + deltaY));
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
          <div className="flex-1 overflow-y-auto">
            <div className={getContentContainerClasses()}>
              {/* Menu Button - Top Right */}
              <div className={`absolute ${position === "right" ? "top-4 right-4" : "top-4 right-8"} z-10`}>
                <Menu>
                  <MenuButton className="text-gray-400 hover:text-white transition-colors">
                    <MoreVertical size={20} />
                  </MenuButton>
                  
                  <MenuItems
                    transition
                    anchor="bottom end"
                    className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm p-1 text-sm transition duration-100 ease-out [--anchor-gap:4px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 z-[60]"
                  >
                    <MenuItem>
                      <button
                        onClick={onReload}
                        disabled={isLoading}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-100 data-focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RotateCcw size={16} />
                        Reload reflection
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={onEditPrompt}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-100 data-focus:bg-white/10"
                      >
                        <Settings size={16} />
                        Edit prompt
                      </button>
                    </MenuItem>
                    <div className="my-1 h-px bg-white/10" />
                    <MenuItem>
                      <button
                        onClick={() => onPositionChange("top")}
                        className={`group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-100 data-focus:bg-white/10 ${position === "top" ? "bg-white/10" : ""}`}
                      >
                        <ArrowUp size={16} />
                        Position: Top
                        {position === "top" && <Check size={14} className="ml-auto" />}
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => onPositionChange("bottom")}
                        className={`group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-100 data-focus:bg-white/10 ${position === "bottom" ? "bg-white/10" : ""}`}
                      >
                        <ArrowDown size={16} />
                        Position: Bottom
                        {position === "bottom" && <Check size={14} className="ml-auto" />}
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => onPositionChange("right")}
                        className={`group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-100 data-focus:bg-white/10 ${position === "right" ? "bg-white/10" : ""}`}
                      >
                        <Sidebar size={16} />
                        Position: Right sidebar
                        {position === "right" && <Check size={14} className="ml-auto" />}
                      </button>
                    </MenuItem>
                    <div className="my-1 h-px bg-white/10" />
                    <MenuItem>
                      <button
                        onClick={onClose}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-100 data-focus:bg-white/10"
                      >
                        <X size={16} />
                        Close panel
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>

              {/* Content */}
              <div className={`text-[0.9rem] leading-relaxed text-white/90 ${position === "right" ? "pr-10" : "pr-12"}`}>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-white/70">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Gathering a tiny spark of insight…</span>
                  </div>
                ) : error ? (
                  <p className="text-red-300 text-xs">{error}</p>
                ) : reflection ? (
                  <div className="whitespace-pre-wrap">{reflection}</div>
                ) : (
                  <p className="text-white/55 text-xs">
                    Use the &quot;AI reflection&quot; option in the menu to generate a brief inspiration for this article.
                  </p>
                )}
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


