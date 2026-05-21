"use client";

import {
  ReactNode,
  createContext,
  useEffect,
  useState,
  useTransition
} from "react";

import { MangaContextProps, MangaState } from "@/types/context.type";

import { SORT_ORDER } from "@/lib/enums";
import { coerceProgressStatusSearchParam } from "@/lib/public-list-infinite-queries";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export const MangaContext = createContext<MangaContextProps | undefined>(
  undefined
);

type MangaProviderProps = {
  children: ReactNode;
};

export const MangaProvider = ({ children }: MangaProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const initialStatusRaw = coerceProgressStatusSearchParam(
    searchParams.get("status") ?? undefined
  );

  const [state, setState] = useState<MangaState>({
    query: initialQuery || "",
    status: initialStatusRaw === "" ? undefined : initialStatusRaw,
    filters: {
      author: undefined,
      genre: undefined,
      theme: undefined,
      malScore: undefined,
      personalScore: undefined
    },
    sort: "title",
    order: SORT_ORDER.ASCENDING
  });

  const debouncedSetQuery = useDebouncedCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
  }, 1000);

  const setQuery = (query: string) => {
    if (query === "") {
      setState((prev) => ({ ...prev, query: "" }));
      return;
    }
    debouncedSetQuery(query);
  };

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
    <MangaContext.Provider
      value={{
        state,
        setQuery,
        setState: (update: Partial<Omit<MangaState, "query">>) =>
          setState((s) => ({ ...s, ...update }))
      }}
    >
      {children}
    </MangaContext.Provider>
  );
};
