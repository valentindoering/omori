"use client";

import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useReducer, Dispatch } from "react";

export type SearchResult = {
  _id: Id<"articles">;
  _creationTime: number;
  createdAt: number;
  title: string;
  userId: Id<"users">;
  icon?: string;
  hasEmbedding: boolean;
  _score: number;
};

export type SearchMode = "idle" | "title" | "embed";

export type SearchState = {
  mode: SearchMode;
  titleQuery: string;
  debouncedTitleQuery: string;
  embedQuery: string;
  debouncedEmbedQuery: string;
  embedResults: SearchResult[];
  embedLoading: boolean;
};

export type SearchAction =
  | { type: "TOGGLE_TITLE" }
  | { type: "TOGGLE_EMBED" }
  | { type: "UPDATE_TITLE_QUERY"; query: string }
  | { type: "UPDATE_EMBED_QUERY"; query: string }
  | { type: "SET_DEBOUNCED_TITLE"; query: string }
  | { type: "SET_DEBOUNCED_EMBED"; query: string }
  | { type: "CLEAR_TITLE" }
  | { type: "CLEAR_EMBED" }
  | { type: "EMBED_LOADING" }
  | { type: "EMBED_SUCCESS"; results: SearchResult[] }
  | { type: "EMBED_ERROR" };

const initialSearchState: SearchState = {
  mode: "idle",
  titleQuery: "",
  debouncedTitleQuery: "",
  embedQuery: "",
  debouncedEmbedQuery: "",
  embedResults: [],
  embedLoading: false,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "TOGGLE_TITLE":
      if (state.mode === "title") {
        return initialSearchState;
      }
      return {
        ...initialSearchState,
        mode: "title",
      };

    case "TOGGLE_EMBED":
      if (state.mode === "embed") {
        return initialSearchState;
      }
      return {
        ...initialSearchState,
        mode: "embed",
      };

    case "UPDATE_TITLE_QUERY":
      return { ...state, titleQuery: action.query };

    case "UPDATE_EMBED_QUERY":
      return { ...state, embedQuery: action.query };

    case "SET_DEBOUNCED_TITLE":
      return { ...state, debouncedTitleQuery: action.query };

    case "SET_DEBOUNCED_EMBED":
      return { ...state, debouncedEmbedQuery: action.query };

    case "CLEAR_TITLE":
      return {
        ...state,
        mode: "idle",
        titleQuery: "",
        debouncedTitleQuery: "",
      };

    case "CLEAR_EMBED":
      return {
        ...state,
        mode: "idle",
        embedQuery: "",
        debouncedEmbedQuery: "",
        embedResults: [],
        embedLoading: false,
      };

    case "EMBED_LOADING":
      return { ...state, embedLoading: true };

    case "EMBED_SUCCESS":
      return {
        ...state,
        embedResults: action.results,
        embedLoading: false,
      };

    case "EMBED_ERROR":
      return {
        ...state,
        embedResults: [],
        embedLoading: false,
      };

    default:
      return state;
  }
}

export function useSearch() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchByEmbedding = useAction((api.embeddings as any).searchByEmbedding);
  const [state, dispatch] = useReducer(searchReducer, initialSearchState);

  // Debounce title query
  useEffect(() => {
    const id = setTimeout(
      () => dispatch({ type: "SET_DEBOUNCED_TITLE", query: state.titleQuery.trim() }),
      250
    );
    return () => clearTimeout(id);
  }, [state.titleQuery]);

  // Debounce embed query
  useEffect(() => {
    const id = setTimeout(
      () => dispatch({ type: "SET_DEBOUNCED_EMBED", query: state.embedQuery.trim() }),
      250
    );
    return () => clearTimeout(id);
  }, [state.embedQuery]);

  // Trigger embedding search when debounced query changes
  useEffect(() => {
    if (state.mode === "embed" && state.debouncedEmbedQuery) {
      dispatch({ type: "EMBED_LOADING" });
      searchByEmbedding({ query: state.debouncedEmbedQuery })
        .then((res) => dispatch({ type: "EMBED_SUCCESS", results: res }))
        .catch(() => dispatch({ type: "EMBED_ERROR" }));
    }
  }, [state.debouncedEmbedQuery, state.mode, searchByEmbedding]);

  return {
    state,
    dispatch: dispatch as Dispatch<SearchAction>,
    titleSearchQuery: state.mode === "title" && state.debouncedTitleQuery ? state.debouncedTitleQuery : undefined,
  };
}

