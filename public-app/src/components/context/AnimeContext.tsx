"use client";

import { ReactNode, createContext, useEffect, useState } from "react";

import { AnimeContextProps, AnimeState } from "@/types/context.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export const AnimeContext = createContext<AnimeContextProps | undefined>(
  undefined
);

type AnimeProviderProps = {
  children: ReactNode;
};

export const AnimeProvider = ({ children }: AnimeProviderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setInternalState] = useState<AnimeState>({
    page: parseInt(searchParams.get("page") || "1"),
    query: searchParams.get("q") || "",
    filters: {
      sortBy: searchParams.get("sortBy") || "title",
      sortOrder:
        (searchParams.get("sortOrder") as SORT_ORDER) || SORT_ORDER.ASCENDING,
      filterGenre: searchParams.get("filterGenre")
        ? parseInt(searchParams.get("filterGenre")!)
        : undefined,
      filterStudio: searchParams.get("filterStudio")
        ? parseInt(searchParams.get("filterStudio")!)
        : undefined,
      filterTheme: searchParams.get("filterTheme")
        ? parseInt(searchParams.get("filterTheme")!)
        : undefined,
      filterProgressStatus:
        (searchParams.get(
          "filterProgressStatus"
        ) as keyof typeof PROGRESS_STATUS) || undefined,
      filterMALScore: searchParams.get("filterMALScore") || undefined,
      filterPersonalScore: searchParams.get("filterPersonalScore") || undefined,
      filterType: searchParams.get("filterType") || undefined
    }
  });

  const debouncedSetQuery = useDebouncedCallback((query: string) => {
    setInternalState((prev) => ({ ...prev, query, page: 1 }));
  }, 1000);

  const setQuery = (query: string) => {
    debouncedSetQuery(query);
  };

  const setStateImmediate = (newState: Partial<Omit<AnimeState, "query">>) => {
    setInternalState((prev) => ({
      ...prev,
      ...newState,
      ...(newState.filters ? { page: 1 } : {})
    }));
  };

  useEffect(() => {
    const params = new URLSearchParams();

    if (state.page) params.set("page", state.page.toString());
    if (state.query) params.set("q", state.query);
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });

    router.push(`/anime?${params.toString()}`);
  }, [state, router]);

  return (
    <AnimeContext.Provider
      value={{ state, setQuery, setState: setStateImmediate }}
    >
      {children}
    </AnimeContext.Provider>
  );
};
