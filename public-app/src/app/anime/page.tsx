import { fetchAllAnimeService } from "@/services/anime.service";
import {
  genreService,
  studioService,
  themeService
} from "@/services/entity.service";

import GeneralFooter from "@/components/GeneralFooter";
import AnimeFilterSortSheet from "@/components/anime/AnimeFilterSortSheet";
import AnimeListSection from "@/components/anime/AnimeListSection";
import AnimeSearch from "@/components/anime/AnimeSearch";

import type { AnimeFilterSort, AnimeList } from "@/types/anime.type";
import { MetadataResponse } from "@/types/api.type";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";

import { SORT_ORDER } from "@/lib/enums";

import { Metadata } from "next";
import { redirect } from "next/navigation";

const PAGINATION_SIZE = 15;

export const metadata: Metadata = {
  title: "Anime Collection | Otaku Corner",
  description:
    "Explore bearking58's curated anime collection, complete with honest reviews and ratings. Discover new favorites and avoid the misses with insights from an average fan.",
  alternates: {
    canonical: "/anime"
  }
};

type SearchParams = {
  searchParams: Promise<
    { page?: string | undefined; q?: string } & AnimeFilterSort
  >;
};

export default async function Page({ searchParams }: SearchParams) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const sortBy = params.sortBy || "title";
  const sortOrder = params.sortOrder || SORT_ORDER.ASCENDING;
  const { page: _page, q: query, ...initialAnimeFilterSort } = params;

  const fetchAnimeList = async (): Promise<[AnimeList[], MetadataResponse]> => {
    const response = await fetchAllAnimeService(
      page,
      PAGINATION_SIZE,
      query,
      sortBy,
      sortOrder,
      initialAnimeFilterSort.filterGenre,
      initialAnimeFilterSort.filterStudio,
      initialAnimeFilterSort.filterTheme,
      initialAnimeFilterSort.filterProgressStatus,
      initialAnimeFilterSort.filterMALScore,
      initialAnimeFilterSort.filterPersonalScore,
      initialAnimeFilterSort.filterType
    );
    if (response.success) {
      return [response.data.data, response.data.metadata];
    } else {
      console.error("Error on fetching anime list:", response.error);
      redirect("/fetch-error");
    }
  };

  const fetchGenreList = async () => {
    const response = await genreService.fetchAll<GenreEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      console.error("Error on fetching genre list:", response.error);
      redirect("/fetch-error");
    }
  };

  const fetchStudioList = async () => {
    const response = await studioService.fetchAll<StudioEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      console.error("Error on fetching studio list:", response.error);
      redirect("/fetch-error");
    }
  };

  const fetchThemeList = async () => {
    const response = await themeService.fetchAll<ThemeEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      console.error("Error on fetching theme list:", response.error);
      redirect("/fetch-error");
    }
  };

  const [initialAnimeList, initialAnimeMetadata] = await fetchAnimeList();
  const initialGenreList = await fetchGenreList();
  const initialStudioList = await fetchStudioList();
  const initialThemeList = await fetchThemeList();

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <AnimeSearch initialQuery={query || ""} />
      <main className="container py-4 xl:py-12 px-4 md:px-6 flex flex-col flex-1">
        <AnimeFilterSortSheet
          genreList={initialGenreList}
          studioList={initialStudioList}
          themeList={initialThemeList}
        />
        <AnimeListSection
          initialAnimeList={initialAnimeList}
          initialAnimeMetadata={initialAnimeMetadata}
        />
      </main>
      <GeneralFooter />
    </div>
  );
}
