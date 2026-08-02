import { useCallback, useState } from "react";

import {
  authorService,
  genreService,
  studioService,
  themeService
} from "@/services/entity.service";

import EntityTabManagement from "@/features/entity-management/components/EntityTabManagement";
import { getMediaEntityTableColumns } from "@/features/entity-management/components/EntityTableColumns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  AuthorWithMediaCount,
  GenreWithMediaCount,
  StudioWithMediaCount,
  ThemeWithMediaCount
} from "@/types/entity.type";

import { entityKeys, mediaKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

type EntityTab = "authors" | "genres" | "studios" | "themes";

const ENTITY_TABS: { value: EntityTab; label: string }[] = [
  { value: "authors", label: "Authors" },
  { value: "genres", label: "Genres" },
  { value: "studios", label: "Studios" },
  { value: "themes", label: "Themes" }
];

const tabListClass =
  "relative flex w-full shrink-0 sm:inline-flex sm:w-auto sm:max-w-full";

const tabTriggerClass =
  "relative z-10 flex-1 sm:flex-initial data-[state=active]:bg-transparent data-[state=active]:shadow-none";

const entityTabHighlightTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34
};

export default function EntityManagementTabs() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<EntityTab>("authors");

  const resetMediaQueries = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
  }, [queryClient]);

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as EntityTab)}
      className="flex w-full flex-col items-start gap-3"
    >
      <TabsList className={cn(tabListClass)}>
        {ENTITY_TABS.map(({ value, label }) => {
          const isActive = tab === value;

          return (
            <TabsTrigger key={value} value={value} className={tabTriggerClass}>
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
        enabled={tab === "authors"}
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
        enabled={tab === "genres"}
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
        enabled={tab === "studios"}
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
        enabled={tab === "themes"}
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
  );
}
