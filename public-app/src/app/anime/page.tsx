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

import { redirect } from "next/navigation";

const START_PAGE = 1;
const PAGINATION_SIZE = 15;

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
      redirect("/fetch-error");
    }
  };

  const fetchGenreList = async () => {
    const response = await genreService.fetchAll<GenreEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      redirect("/fetch-error");
    }
  };

  const fetchStudioList = async () => {
    const response = await studioService.fetchAll<StudioEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      redirect("/fetch-error");
    }
  };

  const fetchThemeList = async () => {
    const response = await themeService.fetchAll<ThemeEntity[]>();
    if (response.success) {
      return response.data;
    } else {
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
