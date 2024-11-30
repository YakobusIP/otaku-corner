"use client";

import { ReactNode, createContext, useEffect, useState } from "react";

import { LightNovelContextProps, LightNovelState } from "@/types/context.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export const LightNovelContext = createContext<
  LightNovelContextProps | undefined
>(undefined);

type LightNovelProviderProps = {
  children: ReactNode;
};

export const LightNovelProvider = ({ children }: LightNovelProviderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setInternalState] = useState<LightNovelState>({
    page: parseInt(searchParams.get("page") || "1"),
    query: searchParams.get("q") || "",
    filters: {
      sortBy: searchParams.get("sortBy") || "title",
      sortOrder:
        (searchParams.get("sortOrder") as SORT_ORDER) || SORT_ORDER.ASCENDING,
      filterAuthor: searchParams.get("filterAuthor")
        ? parseInt(searchParams.get("filterAuthor")!)
        : undefined,
      filterGenre: searchParams.get("filterGenre")
        ? parseInt(searchParams.get("filterGenre")!)
        : undefined,
      filterTheme: searchParams.get("filterTheme")
        ? parseInt(searchParams.get("filterTheme")!)
        : undefined,
      filterProgressStatus:
        (searchParams.get(
          "filterProgressStatus"
        ) as keyof typeof PROGRESS_STATUS) || undefined,
      filterMALScore: searchParams.get("filterMALScore") || undefined,
      filterPersonalScore: searchParams.get("filterPersonalScore") || undefined
    }
  });

  const debouncedSetQuery = useDebouncedCallback((query: string) => {
    setInternalState((prev) => ({ ...prev, query, page: 1 }));
  }, 1000);

  const setQuery = (query: string) => {
    debouncedSetQuery(query);
  };

  const setStateImmediate = (
    newState: Partial<Omit<LightNovelState, "query">>
  ) => {
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

    router.push(`/light-novel?${params.toString()}`);
  }, [state, router]);

  return (
    <LightNovelContext.Provider
      value={{ state, setQuery, setState: setStateImmediate }}
    >
      {children}
    </LightNovelContext.Provider>
  );
};
