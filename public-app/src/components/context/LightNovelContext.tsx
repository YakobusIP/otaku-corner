"use client";

import {
  ReactNode,
  createContext,
  useEffect,
  useState,
  useTransition
} from "react";

import { LightNovelContextProps, LightNovelState } from "@/types/context.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export const LightNovelContext = createContext<
  LightNovelContextProps | undefined
>(undefined);

type LightNovelProviderProps = {
  children: ReactNode;
};

export const LightNovelProvider = ({ children }: LightNovelProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page")) || 1;
  const initialQuery = searchParams.get("q") || "";
  const initialStatus =
    (searchParams.get("status") as keyof typeof PROGRESS_STATUS) || "";

  const [state, setState] = useState<LightNovelState>({
    page: initialPage,
    query: initialQuery || "",
    status: initialStatus || undefined,
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
    <LightNovelContext.Provider
      value={{
        state,
        setQuery,
        setState: (update: Partial<Omit<LightNovelState, "query">>) =>
          setState((s) => ({ ...s, ...update }))
      }}
    >
      {children}
    </LightNovelContext.Provider>
  );
};
