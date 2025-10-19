"use client";

import { Loader2, X } from "lucide-react";
import { ReactNode, useRef, useEffect } from "react";

type SearchControlProps = {
  isOpen: boolean;
  onToggle: () => void;
  query: string;
  setQuery: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  showSpinner: boolean;
  idleIcon: ReactNode;
  widthOpenClass?: string; // e.g. "w-64 mx-2"
  ariaLabel: string;
};

export function SearchControl({
  isOpen,
  onToggle,
  query,
  setQuery,
  onClear,
  placeholder,
  showSpinner,
  idleIcon,
  widthOpenClass = "w-64 mx-2",
  ariaLabel,
}: SearchControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 p-2 hover:bg-hover rounded-full transition-colors"
        aria-label={ariaLabel}
      >
        {showSpinner ? <Loader2 size={16} className="animate-spin" /> : idleIcon}
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 flex items-center h-8 ${
          isOpen ? widthOpenClass : "w-0 mx-0"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-8 bg-transparent text-sm text-white placeholder-gray-500 px-2 py-0 outline-none focus:outline-none focus:ring-0"
        />
        {query && (
          <button
            onClick={onClear}
            className="ml-1 p-1 hover:bg-hover rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </>
  );
}


