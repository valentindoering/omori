import { Loader2, X, RotateCcw, Settings, MoreVertical } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

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
}: AIReflectionDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
    e.preventDefault();
  }, [height]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY.current;
      const newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, dragStartHeight.current + deltaY));
      onHeightChange(newHeight);
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
  }, [isDragging, onHeightChange]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-purple-500/20 via-purple-500/8 to-black/60 backdrop-blur-2xl shadow-[0_22px_80px_rgba(0,0,0,0.85)] overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-4 relative">
              {/* Menu Button - Top Right */}
              <div className="absolute top-4 right-8 z-10">
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
              <div className="text-[0.9rem] leading-relaxed text-white/90 pr-12">
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
                    Use the "AI reflection" option in the menu to generate a brief inspiration for this article.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resize Handle */}
      <div
        className={`fixed left-0 right-0 z-50 h-1 bg-white/5 hover:bg-purple-500/40 transition-colors cursor-ns-resize ${isDragging ? 'bg-purple-500/60' : ''}`}
        style={{ top: `${height}px` }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-0 -top-2 -bottom-2" />
      </div>
    </>
  );
}


