"use client";

import { Search, SearchCheck } from "lucide-react";
import { SearchControl } from "@/components/SearchControl";
import { Dispatch } from "react";
import type { SearchState, SearchAction } from "./useSearch";

type SearchControlsProps = {
  state: SearchState;
  dispatch: Dispatch<SearchAction>;
  status: "LoadingFirstPage" | "CanLoadMore" | "Exhausted" | "LoadingMore";
};

export function SearchControls({ state, dispatch, status }: SearchControlsProps) {

  return (
    <>
      <SearchControl
        isOpen={state.mode === "title"}
        onToggle={() => dispatch({ type: "TOGGLE_TITLE" })}
        query={state.titleQuery}
        setQuery={(query) => dispatch({ type: "UPDATE_TITLE_QUERY", query })}
        onClear={() => dispatch({ type: "CLEAR_TITLE" })}
        placeholder="Title search"
        showSpinner={status === "LoadingFirstPage" && state.mode === "title" && state.debouncedTitleQuery !== ""}
        idleIcon={<Search size={16} />}
        ariaLabel="Toggle search"
      />

      <SearchControl
        isOpen={state.mode === "embed"}
        onToggle={() => dispatch({ type: "TOGGLE_EMBED" })}
        query={state.embedQuery}
        setQuery={(query) => dispatch({ type: "UPDATE_EMBED_QUERY", query })}
        onClear={() => dispatch({ type: "CLEAR_EMBED" })}
        placeholder="Embedding search"
        showSpinner={state.embedLoading && state.mode === "embed" && state.debouncedEmbedQuery !== ""}
        idleIcon={<SearchCheck size={16} />}
        ariaLabel="Toggle embedding search"
      />
    </>
  );
}

