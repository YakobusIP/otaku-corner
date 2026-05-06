import { Dispatch, SetStateAction } from "react";

import SelectedRow from "@/components/add-anime/SelectedRow";
import {
  displayYear,
  formatAired,
  formatRatingLabel,
  posterUrl
} from "@/components/add-anime/anime-dialog-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useAddAnimeDialog } from "@/hooks/useAddAnimeDialog";

import { cn } from "@/lib/utils";

import { Anime } from "@tutkli/jikan-ts";
import {
  CheckIcon,
  ChevronLeftIcon,
  InfoIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  TvIcon
} from "lucide-react";

type Props = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export default function AddAnimeDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: Props) {
  const {
    scrollAreaRef,
    loadMoreRef,
    searchQuery,
    setSearchQuery,
    searchTrimmed,
    searchLoadingInitial,
    searchResults,
    searchTotal,
    isError,
    isFetchingNextPage,
    selectedMalIds,
    addFromSearch,
    activeDetail,
    activeDetailId,
    setActiveDetailId,
    selectedAnime,
    handleDuplicateStatus,
    removeSelected,
    clearSelection,
    hasSelection,
    handleOpenChange,
    submitAdds,
    addAnimeMutation,
    selectionHasDuplicate
  } = useAddAnimeDialog({ openDialog, setOpenDialog, resetParent });

  return (
    <Dialog open={openDialog} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          // Base DialogContent is `grid`; we need a column flex so flex-1 body fills `h-*`.
          "flex! w-[calc(100vw-2rem)] flex-col gap-0! overflow-hidden p-0",
          "h-[min(56rem,92vh)] max-h-[92vh]",
          hasSelection ? "max-w-5xl" : "max-w-md sm:max-w-lg"
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/40 px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold">
            Add new anime entry
          </DialogTitle>
          <DialogDescription>
            Search and select anime to add to your collection
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            // Single column: flex fills flex-1 parent. Two columns: grid must use an explicit
            // row track or auto-rows stay "auto" and the shell shrinks/grows with content.
            "flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 py-4 md:px-6",
            hasSelection &&
              "md:grid md:h-full md:min-h-0 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)] md:items-stretch md:gap-4"
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-border/50 bg-background/40 p-3 backdrop-blur-md md:min-h-0 md:h-full md:max-h-full">
            <div className="relative shrink-0">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime by title…"
                className="h-10 border-primary/50 bg-background/50 pl-9"
              />
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">
              Results from Jikan API
            </p>
            <div
              ref={scrollAreaRef}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
            >
              {searchLoadingInitial ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : searchTrimmed.length < 2 ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10">
                  <p className="text-center text-sm text-muted-foreground">
                    No result
                  </p>
                </div>
              ) : isError ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10">
                  <p className="text-center text-sm text-muted-foreground">
                    No result
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10">
                  <p className="text-center text-sm text-muted-foreground">
                    No result
                  </p>
                </div>
              ) : (
                <>
                  <ul className="flex flex-col gap-2 pr-1">
                    {searchResults.map((anime) => {
                      const alreadySelected = selectedMalIds.has(anime.mal_id);
                      return (
                        <li key={anime.mal_id}>
                          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/30 p-2">
                            <img
                              src={posterUrl(anime)}
                              alt=""
                              className="h-18 w-12 shrink-0 rounded object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold leading-tight">
                                {anime.title_english || anime.title}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {anime.title_japanese || anime.title}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {anime.type ?? "—"}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {displayYear(anime)}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              disabled={alreadySelected}
                              className={cn(
                                "h-9 w-9 shrink-0 border",
                                alreadySelected
                                  ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-400"
                                  : "border-primary/40 bg-primary/15 text-primary hover:bg-primary/25"
                              )}
                              onClick={() => addFromSearch(anime)}
                              aria-label={
                                alreadySelected
                                  ? `${anime.title_english || anime.title} already in selection`
                                  : `Add ${anime.title_english || anime.title}`
                              }
                            >
                              {alreadySelected ? (
                                <CheckIcon className="h-4 w-4" />
                              ) : (
                                <PlusIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div ref={loadMoreRef} className="h-4 shrink-0" />
                  {isFetchingNextPage ? (
                    <div className="flex justify-center py-3 text-xs text-muted-foreground">
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Loading more…
                    </div>
                  ) : null}
                </>
              )}
            </div>
            {searchTrimmed.length >= 2 && searchTotal !== null ? (
              <div className="flex shrink-0 items-center gap-1 border-t border-border/30 pt-2 text-xs text-muted-foreground">
                <InfoIcon className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Showing {searchResults.length} of {searchTotal} results
                </span>
              </div>
            ) : null}
          </div>

          {hasSelection ? (
            <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-xl border border-border/50 bg-background/40 p-3 backdrop-blur-md md:h-full md:max-h-full md:min-h-0">
              <div className="flex shrink-0 items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  Selected Anime ({selectedAnime.length})
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={clearSelection}
                >
                  Clear all
                </Button>
              </div>

              <div
                className={cn(
                  "min-h-0 flex-1 overflow-hidden",
                  activeDetail
                    ? "flex flex-col max-md:flex-1 max-md:min-h-0 md:grid md:min-h-0 md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] md:gap-4"
                    : "flex flex-col"
                )}
              >
                <div
                  className={cn(
                    "min-h-0 overflow-y-auto overscroll-contain",
                    activeDetail ? "max-md:hidden" : "flex-1"
                  )}
                >
                  <ul className="flex flex-col gap-2 pr-1">
                    {selectedAnime.map((anime) => (
                      <SelectedRow
                        key={anime.mal_id}
                        anime={anime}
                        isActive={activeDetailId === anime.mal_id}
                        onDuplicateStatus={handleDuplicateStatus}
                        onPick={() =>
                          setActiveDetailId((id) =>
                            id === anime.mal_id ? null : anime.mal_id
                          )
                        }
                        onRemove={() => removeSelected(anime.mal_id)}
                      />
                    ))}
                  </ul>
                </div>

                {activeDetail ? (
                  <div className="flex min-h-0 flex-1 flex-col border-t border-border/40 pt-2 max-md:min-h-0 md:min-h-0 md:border-t-0 md:pt-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mb-1 h-9 shrink-0 justify-start gap-1 px-2 md:hidden"
                      onClick={() => setActiveDetailId(null)}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      Back to selected list
                    </Button>
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                      <AnimeDetailPanel anime={activeDetail} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-2 border-t border-border/40 px-4 py-4 md:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => submitAdds()}
            disabled={
              addAnimeMutation.isPending ||
              selectedAnime.length === 0 ||
              selectionHasDuplicate
            }
            className="gap-2 bg-primary"
          >
            {addAnimeMutation.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            Add Selected ({selectedAnime.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const AnimeDetailPanel = ({ anime }: { anime: Anime }) => {
  const synopsis =
    anime.synopsis?.replace(/\n\n+/g, "\n").trim() || "No synopsis available.";

  return (
    <div className="space-y-3 text-sm">
      <div className="flex gap-3">
        <img
          src={posterUrl(anime)}
          alt=""
          className="h-36 w-24 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold leading-snug">
            {anime.title_english || anime.title}
          </p>
          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
            <Badge variant="outline">{anime.type ?? "—"}</Badge>
            <Badge variant="outline">{displayYear(anime)}</Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-400">
            <StarIcon className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium">
              {anime.score != null ? anime.score.toFixed(2) : "—"}
            </span>
            <span className="text-muted-foreground">
              ({anime.scored_by?.toLocaleString() ?? "—"} users)
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {synopsis}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <MetaRow label="Status" value={anime.status ?? "—"} />
        <MetaRow label="Aired" value={formatAired(anime)} />
        <MetaRow
          label="Episodes"
          value={anime.episodes != null ? String(anime.episodes) : "?"}
        />
        <MetaRow label="Studio" value={anime.studios?.[0]?.name ?? "—"} />
        <MetaRow label="Source" value={anime.source ?? "—"} />
        <MetaRow
          label="Genres"
          value={anime.genres?.map((g) => g.name).join(", ") || "—"}
        />
        <MetaRow
          label="Themes"
          value={anime.themes?.map((t) => t.name).join(", ") || "—"}
        />
        <MetaRow label="Rating" value={formatRatingLabel(anime)} />
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-0 gap-2">
    <TvIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="wrap-break-word leading-snug">{value}</p>
    </div>
  </div>
);
