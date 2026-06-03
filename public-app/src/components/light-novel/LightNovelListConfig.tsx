"use client";

import FilterAuthor from "@/components/filter-sort-dropdowns/FilterAuthor";
import FilterGenre from "@/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterTheme from "@/components/filter-sort-dropdowns/FilterTheme";
import LightNovelCard from "@/components/light-novel/LightNovelCard";
import { createMediaListContext } from "@/components/media-list/CreateMediaListContext";

import type { MediaListClientConfig } from "@/types/context.type";
import type { LightNovelFilters, LightNovelList } from "@/types/lightnovel.type";

import { lightNovelListQueryConfig } from "@/lib/media-list/light-novel-list-query";
import { printedMediaListEntityLookups } from "@/lib/media-list/media-list-entity-lookups";
import type {
  LightNovelListInfiniteQueryKey,
  PublicLightNovelListInfiniteFilters
} from "@/lib/media-list/query-keys";

const initialLightNovelFilters: LightNovelFilters = {
  author: undefined,
  genre: undefined,
  theme: undefined,
  malScore: undefined,
  personalScore: undefined
};

const lightNovelContext = createMediaListContext<LightNovelFilters>(
  "LightNovelProvider",
  initialLightNovelFilters
);

export const lightNovelListConfig: MediaListClientConfig<
  LightNovelList,
  LightNovelFilters,
  PublicLightNovelListInfiniteFilters,
  LightNovelListInfiniteQueryKey
> = {
  id: lightNovelListQueryConfig.id,
  buildListFiltersFromState: lightNovelListQueryConfig.buildListFiltersFromState,
  getInfiniteQueryOptions: lightNovelListQueryConfig.getInfiniteQueryOptions,
  statusCounts: lightNovelListQueryConfig.statusCounts,
  searchPlaceholder: "Search light novel...",
  header: {
    title: "Light Novel Collection",
    countNoun: "light novels",
    layoutGroupId: "light-novel-status-tabs",
    statusHighlightLayoutId: "light-novel-status-highlight"
  },
  list: {
    loadingImageAlt: "Loading light novels",
    loadingTitle: "Fetching light novels",
    emptyTitle: "No Light Novel Found",
    emptyDescription: "We couldn't find any light novel matching your search",
    browseAllLabel: "Browse All Light Novels"
  },
  context: lightNovelContext,
  entityLookups: printedMediaListEntityLookups,
  filterFields: [
    {
      label: "Genre",
      render: (filters, handleFilter) => (
        <FilterGenre
          selectedGenre={filters.genre}
          handleFilterGenre={handleFilter("genre")}
        />
      )
    },
    {
      label: "Author",
      render: (filters, handleFilter) => (
        <FilterAuthor
          selectedAuthor={filters.author}
          handleFilterAuthor={handleFilter("author")}
        />
      )
    },
    {
      label: "Theme",
      render: (filters, handleFilter) => (
        <FilterTheme
          selectedTheme={filters.theme}
          handleFilterTheme={handleFilter("theme")}
        />
      )
    },
    {
      label: "MAL Score",
      render: (filters, handleFilter) => (
        <FilterMALScore
          selectedMALScore={filters.malScore}
          handleFilterMALScore={handleFilter("malScore")}
        />
      )
    },
    {
      label: "Personal Score",
      render: (filters, handleFilter) => (
        <FilterPersonalScore
          selectedPersonalScore={filters.personalScore}
          handleFilterPersonalScore={handleFilter("personalScore")}
        />
      )
    }
  ],
  activeFilterChips: [
    {
      key: "author",
      label: "Author",
      resolveEntityName: {
        listKey: "authorList",
        unknownLabel: "Unknown author"
      }
    },
    {
      key: "genre",
      label: "Genre",
      resolveEntityName: { listKey: "genreList", unknownLabel: "Unknown genre" }
    },
    {
      key: "theme",
      label: "Theme",
      resolveEntityName: { listKey: "themeList", unknownLabel: "Unknown theme" }
    },
    { key: "malScore", label: "MAL Score", capitalize: true },
    { key: "personalScore", label: "Personal Score", capitalize: true }
  ],
  clearAllFilters: (setQuery, setState) => {
    setQuery("");
    setState({ filters: { ...initialLightNovelFilters } });
  },
  browseAll: (setQuery, setState) => {
    setQuery("");
    setState({ status: undefined, filters: { ...initialLightNovelFilters } });
  },
  renderCard: (lightNovel) => <LightNovelCard lightNovel={lightNovel} />
};
