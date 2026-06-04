"use client";

import { ReactNode } from "react";

import type { MediaListClientConfig } from "@/types/context.type";

type Props<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
> = {
  config: MediaListClientConfig<TItem, TFilters, TListFilters, TInfiniteQueryKey>;
  children: ReactNode;
};

export default function MediaListProvider<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
>({ config, children }: Props<TItem, TFilters, TListFilters, TInfiniteQueryKey>) {
  const { Provider } = config.context;
  return <Provider>{children}</Provider>;
}
