"use client";

import {
  ReactNode,
  createContext,
  useEffect,
  useState,
  useTransition
} from "react";

import { AnimeContextProps, AnimeState } from "@/types/context.type";

import { SORT_ORDER } from "@/lib/enums";
import { coerceProgressStatusSearchParam } from "@/lib/public-list-infinite-queries";

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

  const initialQuery = searchParams.get("q") || "";
  const initialStatusRaw = coerceProgressStatusSearchParam(
    searchParams.get("status") ?? undefined
  );

  const [state, setState] = useState<AnimeState>({
    query: initialQuery || "",
    status: initialStatusRaw === "" ? undefined : initialStatusRaw,
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
    setState((prev) => ({ ...prev, query }));
  }, 1000);

  const setQuery = (query: string) => debouncedSetQuery(query);

  const [_, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams();

      if (state.query) params.set("q", state.query);
      if (state.status) params.set("status", state.status);

      const queryString = params.toString();
      const href = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(href);
    });
  }, [state.query, state.status, pathname, router]);

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
