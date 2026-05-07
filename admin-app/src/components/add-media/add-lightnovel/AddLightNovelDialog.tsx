import { Dispatch, SetStateAction, useEffect, useState } from "react";

import SelectedRow from "@/components/add-media/SelectedRow";
import LightNovelDetailPanel from "@/components/add-media/add-lightnovel/LightNovelDetailPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useAddLightNovelDialog } from "@/hooks/useAddLightNovelDialog";

import {
  displayYearFromPublished,
  posterUrl
} from "@/lib/media-dialog-helpers";
import { cn } from "@/lib/utils";

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  InfoIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon
} from "lucide-react";

type Props = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export default function AddLightNovelDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: Props) {
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!openDialog) setDetailOpen(false);
  }, [openDialog]);

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
    selectedLightNovel,
    handleDuplicateStatus,
    removeSelected,
    clearSelection,
    hasSelection,
    handleOpenChange,
    submitAdds,
    addLightNovelMutation,
    selectionHasDuplicate
  } = useAddLightNovelDialog({ openDialog, setOpenDialog, resetParent });

  const selectedRows = selectedLightNovel.map((lightNovel) => (
    <SelectedRow
      key={lightNovel.mal_id}
      mediaType="lightNovel"
      malId={lightNovel.mal_id}
      titlePrimary={lightNovel.title_english || lightNovel.title}
      titleSecondary={lightNovel.title_japanese || lightNovel.title}
      typeLabel={lightNovel.type ?? "-"}
      yearBadge={displayYearFromPublished(lightNovel)}
      posterSrc={posterUrl(lightNovel)}
      removeAriaTitle={lightNovel.title}
      isActive={activeDetailId === lightNovel.mal_id}
      onDuplicateStatus={handleDuplicateStatus}
      onPick={() =>
        setActiveDetailId((id) => {
          const next = id === lightNovel.mal_id ? null : lightNovel.mal_id;
          setDetailOpen(next !== null);
          return next;
        })
      }
      onRemove={() => removeSelected(lightNovel.mal_id)}
    />
  ));

  return (
    <Dialog open={openDialog} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0",
          "h-[min(56rem,92vh)] max-h-[92vh]",
          hasSelection ? "max-w-5xl" : "max-w-md sm:max-w-lg"
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/40 px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold">
            Add new light novel entry
          </DialogTitle>
          <DialogDescription>
            Search and select light novels to add to your collection
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
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
                placeholder="Search light novels by title…"
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
                    {searchResults.map((lightNovel) => {
                      const alreadySelected = selectedMalIds.has(
                        lightNovel.mal_id
                      );
                      return (
                        <li key={lightNovel.mal_id}>
                          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/30 p-2">
                            <img
                              src={posterUrl(lightNovel)}
                              alt=""
                              className="h-18 w-12 shrink-0 rounded object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold leading-tight">
                                {lightNovel.title_english || lightNovel.title}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {lightNovel.title_japanese || lightNovel.title}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {lightNovel.type ?? "—"}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {displayYearFromPublished(lightNovel)}
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
                              onClick={() => addFromSearch(lightNovel)}
                              aria-label={
                                alreadySelected
                                  ? `${lightNovel.title_english || lightNovel.title} already in selection`
                                  : `Add ${lightNovel.title_english || lightNovel.title}`
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
            <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border/50 bg-background/40 backdrop-blur-md md:h-full md:max-h-full md:min-h-0">
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/40 px-3 py-1.5">
                <p className="text-sm font-medium">
                  Selected Light Novels ({selectedLightNovel.length})
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

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:hidden">
                  {!activeDetail ? (
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-2">
                      <ul className="flex flex-col gap-2 pr-1">
                        {selectedRows}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-border/40">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 shrink-0 justify-start gap-1 px-3 pt-2"
                        onClick={() => setActiveDetailId(null)}
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to selected list
                      </Button>
                      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-3">
                        <LightNovelDetailPanel lightNovel={activeDetail} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden min-h-0 flex-1 flex-col overflow-hidden md:flex">
                  <div
                    className={cn(
                      "min-h-0 overflow-y-auto overscroll-contain px-3 pb-3 pt-2",
                      detailOpen ? "h-1/2 max-h-[50%] shrink-0" : "flex-1"
                    )}
                  >
                    <ul className="flex flex-col gap-2 pr-1">{selectedRows}</ul>
                  </div>

                  <Collapsible
                    open={detailOpen}
                    onOpenChange={setDetailOpen}
                    className={cn(
                      "flex flex-col border-t border-border/40",
                      detailOpen
                        ? "h-1/2 max-h-[50%] min-h-0 shrink-0"
                        : "shrink-0"
                    )}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm font-medium hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {detailOpen ? (
                          <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        ) : (
                          <ChevronUpIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        )}
                        Light novel detail
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="min-h-0 flex-1 overflow-hidden">
                      <div className="max-h-full min-h-0 overflow-y-auto overscroll-contain px-3 pb-3 pt-3">
                        {activeDetail ? (
                          <LightNovelDetailPanel lightNovel={activeDetail} />
                        ) : (
                          <p className="py-8 text-center text-sm text-muted-foreground">
                            No detail
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
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
              addLightNovelMutation.isPending ||
              selectedLightNovel.length === 0 ||
              selectionHasDuplicate
            }
            className="gap-2 bg-primary"
          >
            {addLightNovelMutation.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            Add Selected ({selectedLightNovel.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
