"use client";

import {
  ReactNode,
  createContext,
  useEffect,
  useState,
  useTransition
} from "react";

import { AnimeContextProps, AnimeState } from "@/types/context.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export const AnimeContext = createContext<AnimeContextProps | undefined>(
  undefined
);

type AnimeProviderProps = {
  children: ReactNode;
};

export const AnimeProvider = ({ children }: AnimeProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page")) || 1;
  const initialQuery = searchParams.get("q") || "";
  const initialStatus =
    (searchParams.get("status") as keyof typeof PROGRESS_STATUS) || "";

  const [state, setState] = useState<AnimeState>({
    page: initialPage,
    query: initialQuery || "",
    status: initialStatus || undefined,
    filters: {
      genre: undefined,
      studio: undefined,
      theme: undefined,
      malScore: undefined,
      personalScore: undefined,
      type: undefined
    },
    sort: "title",
    order: SORT_ORDER.ASCENDING
  });

  const debouncedSetQuery = useDebouncedCallback((query: string) => {
    setState((prev) => ({ ...prev, query, page: 1 }));
  }, 1000);

  const setQuery = (query: string) => debouncedSetQuery(query);

  const [_, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams();

      params.set("page", String(state.page));
      if (state.query) params.set("q", state.query);
      if (state.status) params.set("status", state.status);

      const href = `${pathname}?${params.toString()}`;
      router.replace(href);
    });
  }, [state.page, state.query, state.status, pathname, router]);

  return (
    <AnimeContext.Provider
      value={{
        state,
        setQuery,
        setState: (update: Partial<Omit<AnimeState, "query">>) =>
          setState((s) => ({ ...s, ...update }))
      }}
    >
      {children}
    </AnimeContext.Provider>
  );
};
