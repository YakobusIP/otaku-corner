"use client";

import { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";

import type { MediaListClientConfig } from "@/types/context.type";

import { SearchIcon } from "lucide-react";

type Props<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
> = {
  config: MediaListClientConfig<
    TItem,
    TFilters,
    TListFilters,
    TInfiniteQueryKey
  >;
};

export default function MediaListSearch<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
>({ config }: Props<TItem, TFilters, TListFilters, TInfiniteQueryKey>) {
  const { state, setQuery } = config.context.useMediaListContext();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <div className="relative min-w-0 w-full">
      <SearchIcon
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
        size={18}
      />
      <Input
        placeholder={config.searchPlaceholder}
        value={state.queryInput}
        onChange={handleChange}
        className="pl-10 w-full bg-white/60 backdrop-blur-sm border-white/40 text-slate-800 placeholder:text-slate-600"
      />
    </div>
  );
}
