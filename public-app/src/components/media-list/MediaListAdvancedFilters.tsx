"use client";

import { Dispatch, SetStateAction } from "react";

import type { MediaListClientConfig } from "@/types/context.type";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/shared/utils";

import { XIcon } from "lucide-react";

type Props<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
> = {
  config: MediaListClientConfig<TItem, TFilters, TListFilters, TInfiniteQueryKey>;
  setShowAdvancedFilters: Dispatch<SetStateAction<boolean>>;
  layout?: "inline" | "dialog";
};

export default function MediaListAdvancedFilters<
  TItem extends { id: number },
  TFilters extends Record<string, unknown>,
  TListFilters extends Record<string, unknown>,
  TInfiniteQueryKey extends readonly unknown[]
>({
  config,
  setShowAdvancedFilters,
  layout = "inline"
}: Props<TItem, TFilters, TListFilters, TInfiniteQueryKey>) {
  const { state, setState } = config.context.useMediaListContext();
  const { filters } = state;

  const handleFilter =
    <K extends keyof TFilters & string>(field: K) =>
    (value?: number | string) => {
      setState({
        filters: {
          ...filters,
          [field]: value
        }
      });
    };

  const hasNoActiveFilters = Object.values(filters).every(
    (value) => value === undefined
  );

  const handleClearAllFilter = () => {
    setState({
      filters: Object.fromEntries(
        Object.keys(filters).map((key) => [key, undefined])
      ) as TFilters
    });
  };

  const clearAllButton = (
    <Button
      variant="outline"
      className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
      disabled={hasNoActiveFilters}
      onClick={handleClearAllFilter}
    >
      Clear All
    </Button>
  );

  const filterFields = (
    <div
      className={cn(
        "grid gap-4",
        layout === "dialog"
          ? "grid-cols-1"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {config.filterFields.map((field) => (
        <div key={field.label}>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {field.label}
          </label>
          {field.render(filters, handleFilter)}
        </div>
      ))}

      {layout === "inline" ? (
        <div className="flex items-end">{clearAllButton}</div>
      ) : null}
    </div>
  );

  if (layout === "dialog") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-white/40 px-4 py-4 pr-12">
          <h3 className="font-semibold text-slate-800">Advanced Filters</h3>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {filterFields}
        </div>
        <div className="shrink-0 border-t border-white/40 px-4 py-4">
          {clearAllButton}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white/60 backdrop-blur-xl rounded-lg border border-white/40 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">Advanced Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvancedFilters(false)}
          className="text-slate-600 hover:text-slate-800"
        >
          <XIcon size={16} />
        </Button>
      </div>

      {filterFields}
    </div>
  );
}
