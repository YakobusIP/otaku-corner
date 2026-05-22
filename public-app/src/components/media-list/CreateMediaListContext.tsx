"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition
} from "react";

import type {
  MediaListContextBundle,
  MediaListContextValue,
  MediaListState
} from "@/types/context.type";

import { SORT_ORDER } from "@/lib/enums";
import { coerceProgressStatusSearchParam } from "@/lib/public-list-infinite-queries";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export const createMediaListContext = <TFilters extends Record<string, unknown>>(
  providerLabel: string,
  initialFilters: TFilters
): MediaListContextBundle<TFilters> => {
  const Context = createContext<MediaListContextValue<TFilters> | undefined>(
    undefined
  );

  const Provider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialQuery = searchParams.get("q") || "";
    const initialStatusRaw = coerceProgressStatusSearchParam(
      searchParams.get("status") ?? undefined
    );

    const [state, setState] = useState<MediaListState<TFilters>>({
      query: initialQuery || "",
      status: initialStatusRaw === "" ? undefined : initialStatusRaw,
      filters: { ...initialFilters },
      sort: "title",
      order: SORT_ORDER.ASCENDING
    });

    const debouncedSetQuery = useDebouncedCallback((query: string) => {
      setState((prev) => ({ ...prev, query }));
    }, 1000);

    const setQuery = (query: string) => {
      if (query === "") {
        debouncedSetQuery.cancel();
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
      <Context.Provider
        value={{
          state,
          setQuery,
          setState: (update: Partial<Omit<MediaListState<TFilters>, "query">>) =>
            setState((current) => ({ ...current, ...update }))
        }}
      >
        {children}
      </Context.Provider>
    );
  };

  const useMediaListContext = () => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(
        `useMediaListContext must be used within a ${providerLabel}`
      );
    }
    return context;
  };

  return { Provider, useMediaListContext };
};
