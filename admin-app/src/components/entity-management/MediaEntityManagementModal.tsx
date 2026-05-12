import { useState } from "react";

import {
  authorService,
  genreService,
  studioService,
  themeService
} from "@/services/entity.service";

import EntityTabManagement from "@/components/entity-management/EntityTabManagement";
import { getMediaEntityTableColumns } from "@/components/entity-management/EntityTableColumns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  AuthorWithMediaCount,
  GenreWithMediaCount,
  StudioWithMediaCount,
  ThemeWithMediaCount
} from "@/types/entity.type";

import { entityKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

import { motion } from "framer-motion";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resetMediaQueries: () => Promise<void>;
};

const tabListClass =
  "relative flex w-full shrink-0 sm:inline-flex sm:w-auto sm:max-w-full";

const tabTriggerClass =
  "relative z-10 flex-1 sm:flex-initial data-[state=active]:bg-transparent data-[state=active]:shadow-none";

const entityTabHighlightTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34
};

type EntityTab = "authors" | "genres" | "studios" | "themes";

const ENTITY_TABS: { value: EntityTab; label: string }[] = [
  { value: "authors", label: "Authors" },
  { value: "genres", label: "Genres" },
  { value: "studios", label: "Studios" },
  { value: "themes", label: "Themes" }
];

export default function MediaEntityManagementModal({
  open,
  onOpenChange,
  resetMediaQueries
}: Props) {
  const [tab, setTab] = useState<EntityTab>("authors");

  const loadAuthors = open && tab === "authors";
  const loadGenres = open && tab === "genres";
  const loadStudios = open && tab === "studios";
  const loadThemes = open && tab === "themes";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex w-[calc(100vw-2rem)] max-w-4xl flex-col gap-0 overflow-hidden border-border/60 bg-background p-0 shadow-xl sm:rounded-xl",
          "h-[min(44rem,90vh)] max-h-[90vh]"
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/40 px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold">
            Media Entity Management
          </DialogTitle>
          <DialogDescription>
            Manage created entities from added media
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as EntityTab)}
          className="flex min-h-0 flex-1 flex-col items-start gap-3 px-6 pb-5 pt-4"
        >
          <TabsList className={tabListClass}>
            {ENTITY_TABS.map(({ value, label }) => {
              const isActive = tab === value;

              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={tabTriggerClass}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="entity-management-tab-highlight"
                      aria-hidden
                      className="pointer-events-none absolute inset-y-px left-0 right-0 z-0 rounded-sm bg-background shadow-xs"
                      transition={entityTabHighlightTransition}
                    />
                  ) : null}
                  <span className="relative z-10">{label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <EntityTabManagement<AuthorWithMediaCount>
            enabled={loadAuthors}
            resetParent={resetMediaQueries}
            tabValue="authors"
            entityTypeLabel="Author"
            entityNounLower="author"
            entityQueryKey={entityKeys.authors()}
            service={authorService}
            getColumns={(edit, pending, label, editDialog) =>
              getMediaEntityTableColumns<AuthorWithMediaCount>(
                label,
                edit,
                pending,
                editDialog
              )
            }
          />
          <EntityTabManagement<GenreWithMediaCount>
            enabled={loadGenres}
            resetParent={resetMediaQueries}
            tabValue="genres"
            entityTypeLabel="Genre"
            entityNounLower="genre"
            entityQueryKey={entityKeys.genres()}
            service={genreService}
            getColumns={(edit, pending, label, editDialog) =>
              getMediaEntityTableColumns<GenreWithMediaCount>(
                label,
                edit,
                pending,
                editDialog
              )
            }
          />
          <EntityTabManagement<StudioWithMediaCount>
            enabled={loadStudios}
            resetParent={resetMediaQueries}
            tabValue="studios"
            entityTypeLabel="Studio"
            entityNounLower="studio"
            entityQueryKey={entityKeys.studios()}
            service={studioService}
            getColumns={(edit, pending, label, editDialog) =>
              getMediaEntityTableColumns<StudioWithMediaCount>(
                label,
                edit,
                pending,
                editDialog
              )
            }
          />
          <EntityTabManagement<ThemeWithMediaCount>
            enabled={loadThemes}
            resetParent={resetMediaQueries}
            tabValue="themes"
            entityTypeLabel="Theme"
            entityNounLower="theme"
            entityQueryKey={entityKeys.themes()}
            service={themeService}
            getColumns={(edit, pending, label, editDialog) =>
              getMediaEntityTableColumns<ThemeWithMediaCount>(
                label,
                edit,
                pending,
                editDialog
              )
            }
          />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
