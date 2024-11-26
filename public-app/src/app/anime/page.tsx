import AnimeListClient from "@/app/anime/AnimeListClient";

import { fetchAllAnimeService } from "@/services/anime.service";
import {
  genreService,
  studioService,
  themeService
} from "@/services/entity.service";

import type { AnimeList } from "@/types/anime.type";
import { MetadataResponse } from "@/types/api.type";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";

import { SORT_ORDER } from "@/lib/enums";

import { Metadata } from "next";
import { redirect } from "next/navigation";

const START_PAGE = 1;
const PAGINATION_SIZE = 15;

export const metadata: Metadata = {
  title: "Anime Collection | Otaku Corner",
  description:
    "Explore bearking58's curated anime collection, complete with honest reviews and ratings. Discover new favorites and avoid the misses with insights from an average fan.",
  alternates: {
    canonical: "/anime"
  }
};

export default async function Page() {
  const fetchAnimeList = async (): Promise<[AnimeList[], MetadataResponse]> => {
    const response = await fetchAllAnimeService(
      START_PAGE,
      PAGINATION_SIZE,
      undefined,
      "title",
      SORT_ORDER.ASCENDING
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
    <AnimeListClient
      initialAnimeList={initialAnimeList}
      initialAnimeMetadata={initialAnimeMetadata}
      initialGenreList={initialGenreList}
      initialStudioList={initialStudioList}
      initialThemeList={initialThemeList}
    />
  );
}
