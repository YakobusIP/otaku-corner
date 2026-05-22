"use client";

import FilterAuthor from "@/components/filter-sort-dropdowns/FilterAuthor";
import FilterGenre from "@/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterTheme from "@/components/filter-sort-dropdowns/FilterTheme";
import { createMediaListContext } from "@/components/media-list/CreateMediaListContext";
import MangaCard from "@/components/manga/MangaCard";

import { authorService, genreService, themeService } from "@/services/entity.service";

import type { MediaListClientConfig } from "@/types/context.type";
import type { AuthorEntity, GenreEntity, ThemeEntity } from "@/types/entity.type";
import type { MangaFilters, MangaList } from "@/types/manga.type";

import { mangaListQueryConfig } from "@/lib/manga-list-query";
import type {
  MangaListInfiniteQueryKey,
  PublicMangaListInfiniteFilters
} from "@/lib/query-keys";

const initialMangaFilters: MangaFilters = {
  author: undefined,
  genre: undefined,
  theme: undefined,
  malScore: undefined,
  personalScore: undefined
};

const mangaContext = createMediaListContext<MangaFilters>(
  "MangaProvider",
  initialMangaFilters
);

export const mangaListConfig: MediaListClientConfig<
  MangaList,
  MangaFilters,
  PublicMangaListInfiniteFilters,
  MangaListInfiniteQueryKey
> = {
  id: mangaListQueryConfig.id,
  buildListFiltersFromState: mangaListQueryConfig.buildListFiltersFromState,
  getInfiniteQueryOptions: mangaListQueryConfig.getInfiniteQueryOptions,
  statusCounts: mangaListQueryConfig.statusCounts,
  searchPlaceholder: "Search manga...",
  header: {
    title: "Manga Collection",
    countNoun: "mangas",
    layoutGroupId: "manga-status-tabs",
    statusHighlightLayoutId: "manga-status-highlight"
  },
  list: {
    loadingImageAlt: "Loading mangas",
    loadingTitle: "Fetching mangas",
    emptyTitle: "No Manga Found",
    emptyDescription: "We couldn't find any manga matching your search",
    browseAllLabel: "Browse All Manga"
  },
  context: mangaContext,
  entityLookups: [
    {
      resultKey: "genreList",
      queryKey: ["genres"],
      queryFn: () => genreService.fetchAll<GenreEntity>()
    },
    {
      resultKey: "authorList",
      queryKey: ["authors"],
      queryFn: () => authorService.fetchAll<AuthorEntity>()
    },
    {
      resultKey: "themeList",
      queryKey: ["themes"],
      queryFn: () => themeService.fetchAll<ThemeEntity>()
    }
  ],
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
    setState({ filters: { ...initialMangaFilters } });
  },
  browseAll: (setQuery, setState) => {
    setQuery("");
    setState({ status: undefined, filters: { ...initialMangaFilters } });
  },
  renderCard: (manga) => <MangaCard manga={manga} />
};
