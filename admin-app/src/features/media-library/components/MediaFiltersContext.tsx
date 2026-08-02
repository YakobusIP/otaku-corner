import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { SORT_ORDER } from "@/lib/enums";
import { MediaTypeFilter } from "@/lib/query-keys";

import { useSearchParams } from "react-router-dom";

const VALID_MEDIA_TYPES: ReadonlySet<string> = new Set(["all", "anime", "manga", "lightNovel"]);
const VALID_SORT_ORDERS: ReadonlySet<string> = new Set([SORT_ORDER.ASCENDING, SORT_ORDER.DESCENDING]);

const validateMediaType = (value: string | null): MediaTypeFilter => {
  if (value && VALID_MEDIA_TYPES.has(value)) return value as MediaTypeFilter;
  return defaultState.mediaType;
};

const validateSortOrder = (value: string | null): SORT_ORDER => {
  if (value && VALID_SORT_ORDERS.has(value)) return value as SORT_ORDER;
  return defaultState.sortOrder;
};

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

const hasStateChanges = (
  previous: MediaFiltersState,
  updates: Partial<MediaFiltersState>
) => {
  return Object.entries(updates).some(
    ([key, value]) =>
      previous[key as keyof MediaFiltersState] !==
      (value as MediaFiltersState[keyof MediaFiltersState])
  );
};

export const MediaFiltersProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setInternalState] = useState<MediaFiltersState>(() => ({
    ...defaultState,
    mediaType: validateMediaType(searchParams.get("mediaType")),
    page: Number(searchParams.get("page")) || defaultState.page,
    query: searchParams.get("q") ?? defaultState.query,
    sortBy: searchParams.get("sortBy") ?? defaultState.sortBy,
    sortOrder: validateSortOrder(searchParams.get("sortOrder")),
    progressStatus: searchParams.get("status") ?? undefined
  }));

  const setState = useCallback((updater: Partial<MediaFiltersState>) => {
    setInternalState((prev) =>
      hasStateChanges(prev, updater) ? { ...prev, ...updater } : prev
    );
  }, []);

  const resetFilters = useCallback(() => {
    setInternalState((prev) => {
      const next = {
        ...defaultState,
        mediaType: prev.mediaType
      };

      return hasStateChanges(prev, next) ? next : prev;
    });
  }, []);

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
    [resetFilters, setState, state]
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
