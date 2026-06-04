import { type SetStateAction, lazy, useCallback, useState } from "react";
import { Suspense } from "react";

import MediaEntityManagementModal from "@/components/entity-management/MediaEntityManagementModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { mediaKeys } from "@/lib/query-keys";

import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpenIcon,
  ChevronDownIcon,
  FileTextIcon,
  SettingsIcon,
  TvIcon
} from "lucide-react";

const AddAnimeDialog = lazy(
  () => import("@/components/add-media/add-anime/AddAnimeDialog")
);
const AddMangaDialog = lazy(
  () => import("@/components/add-media/add-manga/AddMangaDialog")
);
const AddLightNovelDialog = lazy(
  () => import("@/components/add-media/add-lightnovel/AddLightNovelDialog")
);

type DialogType = "anime" | "manga" | "lightNovel";

export default function AddMediaDropdown() {
  const queryClient = useQueryClient();

  const resetLists = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
  }, [queryClient]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<DialogType | null>(null);
  const [entityModalOpen, setEntityModalOpen] = useState(false);

  const openDialogFromMenu = function openDialogForMenu(dialog: DialogType) {
    return function handleMenuSelect(e: Event) {
      e.preventDefault();
      setMenuOpen(false);
      setActiveDialog(dialog);
    };
  };

  const openEntityModal = (e: Event) => {
    e.preventDefault();
    setMenuOpen(false);
    setEntityModalOpen(true);
  };

  const makeDialogSetter = function makeDialogSetterFor(dialog: DialogType) {
    return function setDialogOpen(next: SetStateAction<boolean>) {
      setActiveDialog((prevDialog) => {
        const prevOpen = prevDialog === dialog;
        const nextOpen = typeof next === "function" ? next(prevOpen) : next;
        return nextOpen ? dialog : null;
      });
    };
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Manage media"
            className="w-9 shrink-0 gap-2 border border-white/15 bg-linear-to-r from-[#4F8CFF] via-[#7C6CF6] to-[#A855F7] px-0 text-white shadow-md transition-[filter,box-shadow] hover:bg-linear-to-r hover:from-[#4F8CFF] hover:via-[#7C6CF6] hover:to-[#A855F7] hover:text-white hover:brightness-110 focus-visible:ring-white/35 active:brightness-95 md:w-auto md:px-3"
          >
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden md:inline">Manage</span>
            <ChevronDownIcon className="hidden h-4 w-4 opacity-80 md:inline-block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-50 border-border/60 bg-popover/95 backdrop-blur-md"
        >
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Media
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="gap-2"
            onSelect={openDialogFromMenu("anime")}
          >
            <TvIcon className="h-4 w-4" />
            Add Anime
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onSelect={openDialogFromMenu("manga")}
          >
            <BookOpenIcon className="h-4 w-4" />
            Add Manga
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onSelect={openDialogFromMenu("lightNovel")}
          >
            <FileTextIcon className="h-4 w-4" />
            Add Light Novel
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Management
          </DropdownMenuLabel>
          <DropdownMenuItem className="gap-2" onSelect={openEntityModal}>
            <SettingsIcon className="h-4 w-4" />
            Entity Management
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeDialog === "anime" ? (
        <Suspense fallback={null}>
          <AddAnimeDialog
            openDialog
            setOpenDialog={makeDialogSetter("anime")}
            resetParent={resetLists}
          />
        </Suspense>
      ) : null}
      {activeDialog === "manga" ? (
        <Suspense fallback={null}>
          <AddMangaDialog
            openDialog
            setOpenDialog={makeDialogSetter("manga")}
            resetParent={resetLists}
          />
        </Suspense>
      ) : null}
      {activeDialog === "lightNovel" ? (
        <Suspense fallback={null}>
          <AddLightNovelDialog
            openDialog
            setOpenDialog={makeDialogSetter("lightNovel")}
            resetParent={resetLists}
          />
        </Suspense>
      ) : null}

      <MediaEntityManagementModal
        open={entityModalOpen}
        onOpenChange={setEntityModalOpen}
        resetMediaQueries={resetLists}
      />
    </>
  );
}
