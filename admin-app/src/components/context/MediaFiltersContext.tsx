import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { SORT_ORDER } from "@/lib/enums";
import { MediaTypeFilter } from "@/lib/query-keys";

import { useSearchParams } from "react-router-dom";

type MediaFiltersState = {
  mediaType: MediaTypeFilter;
  page: number;
  limit: number;
  query: string;
  sortBy: string;
  sortOrder: SORT_ORDER;
  progressStatus?: string;
  genre?: number;
  studio?: number;
  theme?: number;
  author?: number;
  malScore?: string;
  personalScore?: string;
  type?: string;
  statusCheck?: string;
};

type MediaFiltersContextValue = {
  state: MediaFiltersState;
  setState: (updater: Partial<MediaFiltersState>) => void;
  resetFilters: () => void;
};

const defaultState: MediaFiltersState = {
  mediaType: "all",
  page: 1,
  limit: 10,
  query: "",
  sortBy: "title",
  sortOrder: SORT_ORDER.ASCENDING,
  progressStatus: undefined,
  genre: undefined,
  studio: undefined,
  theme: undefined,
  author: undefined,
  malScore: undefined,
  personalScore: undefined,
  type: undefined,
  statusCheck: undefined
};

const MediaFiltersContext = createContext<MediaFiltersContextValue | undefined>(
  undefined
);

export const MediaFiltersProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setInternalState] = useState<MediaFiltersState>(() => ({
    ...defaultState,
    mediaType:
      (searchParams.get("mediaType") as MediaTypeFilter | null) ??
      defaultState.mediaType,
    page: Number(searchParams.get("page")) || defaultState.page,
    query: searchParams.get("q") ?? defaultState.query,
    sortBy: searchParams.get("sortBy") ?? defaultState.sortBy,
    sortOrder:
      (searchParams.get("sortOrder") as SORT_ORDER | null) ??
      defaultState.sortOrder,
    progressStatus: searchParams.get("status") ?? undefined
  }));

  const setState = (updater: Partial<MediaFiltersState>) => {
    setInternalState((prev) => ({
      ...prev,
      ...updater
    }));
  };

  const resetFilters = () => {
    setInternalState((prev) => ({
      ...defaultState,
      mediaType: prev.mediaType
    }));
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("mediaType", state.mediaType);
    params.set("page", String(state.page));
    if (state.query) params.set("q", state.query);
    params.set("sortBy", state.sortBy);
    params.set("sortOrder", state.sortOrder);
    if (state.progressStatus) params.set("status", state.progressStatus);

    setSearchParams(params, { replace: true });
  }, [
    searchParams,
    setSearchParams,
    state.mediaType,
    state.page,
    state.progressStatus,
    state.query,
    state.sortBy,
    state.sortOrder
  ]);

  const value = useMemo(
    () => ({
      state,
      setState,
      resetFilters
    }),
    [state]
  );

  return (
    <MediaFiltersContext.Provider value={value}>
      {children}
    </MediaFiltersContext.Provider>
  );
};

export function useMediaFilters() {
  const context = useContext(MediaFiltersContext);
  if (!context) {
    throw new Error(
      "useMediaFilters must be used within a MediaFiltersProvider"
    );
  }
  return context;
}
