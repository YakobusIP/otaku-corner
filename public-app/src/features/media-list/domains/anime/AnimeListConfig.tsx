"use client";

import AnimeCard from "@/features/media-list/domains/anime/AnimeCard";
import FilterGenre from "@/features/media-list/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/features/media-list/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/features/media-list/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterStudio from "@/features/media-list/components/filter-sort-dropdowns/FilterStudio";
import FilterTheme from "@/features/media-list/components/filter-sort-dropdowns/FilterTheme";
import FilterType from "@/features/media-list/components/filter-sort-dropdowns/FilterType";
import { createMediaListContext } from "@/features/media-list/components/CreateMediaListContext";

import type { AnimeFilters, AnimeList } from "@/types/anime.type";
import type { MediaListClientConfig } from "@/types/context.type";

import { animeListQueryConfig } from "@/features/media-list/lib/anime-list-query";
import { animeListEntityLookups } from "@/features/media-list/lib/media-list-entity-lookups";
import type {
  AnimeListInfiniteQueryKey,
  PublicAnimeListInfiniteFilters
} from "@/features/media-list/lib/query-keys";

const initialAnimeFilters: AnimeFilters = {
  genre: undefined,
  studio: undefined,
  theme: undefined,
  malScore: undefined,
  personalScore: undefined,
  type: undefined
};

const animeContext = createMediaListContext<AnimeFilters>(
  "AnimeProvider",
  initialAnimeFilters
);

export const animeListConfig: MediaListClientConfig<
  AnimeList,
  AnimeFilters,
  PublicAnimeListInfiniteFilters,
  AnimeListInfiniteQueryKey
> = {
  id: animeListQueryConfig.id,
  buildListFiltersFromState: animeListQueryConfig.buildListFiltersFromState,
  getInfiniteQueryOptions: animeListQueryConfig.getInfiniteQueryOptions,
  statusCounts: animeListQueryConfig.statusCounts,
  searchPlaceholder: "Search anime...",
  header: {
    title: "Anime Watchlist",
    countNoun: "animes",
    layoutGroupId: "anime-status-tabs",
    statusHighlightLayoutId: "anime-status-highlight"
  },
  list: {
    loadingImageAlt: "Loading animes",
    loadingTitle: "Fetching animes",
    emptyTitle: "No Anime Found",
    emptyDescription: "We couldn't find any anime matching your search",
    browseAllLabel: "Browse All Anime"
  },
  context: animeContext,
  entityLookups: animeListEntityLookups,
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
      label: "Studio",
      render: (filters, handleFilter) => (
        <FilterStudio
          selectedStudio={filters.studio}
          handleFilterStudio={handleFilter("studio")}
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
    },
    {
      label: "Type",
      render: (filters, handleFilter) => (
        <FilterType
          selectedType={filters.type}
          handleFilterType={handleFilter("type")}
        />
      )
    }
  ],
  activeFilterChips: [
    {
      key: "genre",
      label: "Genre",
      resolveEntityName: { listKey: "genreList", unknownLabel: "Unknown genre" }
    },
    {
      key: "studio",
      label: "Studio",
      resolveEntityName: {
        listKey: "studioList",
        unknownLabel: "Unknown studio"
      }
    },
    {
      key: "theme",
      label: "Theme",
      resolveEntityName: { listKey: "themeList", unknownLabel: "Unknown theme" }
    },
    { key: "malScore", label: "MAL Score", capitalize: true },
    { key: "personalScore", label: "Personal Score", capitalize: true },
    { key: "type", label: "Type" }
  ],
  clearAllFilters: (setQuery, setState) => {
    setQuery("");
    setState({ filters: { ...initialAnimeFilters } });
  },
  browseAll: (setQuery, setState) => {
    setQuery("");
    setState({ status: undefined, filters: { ...initialAnimeFilters } });
  },
  renderCard: (anime) => <AnimeCard anime={anime} />
};
