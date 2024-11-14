import MangaListClient from "@/app/manga/MangaListClient";

import {
  authorService,
  genreService,
  themeService
} from "@/services/entity.service";
import { fetchAllMangaService } from "@/services/manga.service";

import { MetadataResponse } from "@/types/api.type";
import { AuthorEntity, GenreEntity, ThemeEntity } from "@/types/entity.type";
import type { MangaList } from "@/types/manga.type";

import { SORT_ORDER } from "@/lib/enums";

import { redirect } from "next/navigation";

const START_PAGE = 1;
const PAGINATION_SIZE = 15;

export default async function Page() {
  const fetchMangaList = async (): Promise<[MangaList[], MetadataResponse]> => {
    const response = await fetchAllMangaService(
      START_PAGE,
      PAGINATION_SIZE,
      undefined,
      "title",
      SORT_ORDER.ASCENDING
    );
    if (response.success) {
      return [response.data.data, response.data.metadata];
    } else {
      console.error(response.error);
      redirect("/fetch-error");
    }
  };

  const fetchAuthorList = async () => {
    const response = await authorService.fetchAll<AuthorEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      console.error(response.error);
      redirect("/fetch-error");
    }
  };

  const fetchGenreList = async () => {
    const response = await genreService.fetchAll<GenreEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      console.error(response.error);
      redirect("/fetch-error");
    }
  };

  const fetchThemeList = async () => {
    const response = await themeService.fetchAll<ThemeEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      console.error(response.error);
      redirect("/fetch-error");
    }
  };

  const [initialMangaList, initialMangaMetadata] = await fetchMangaList();
  const initialAuthorList = await fetchAuthorList();
  const initialGenreList = await fetchGenreList();
  const initialThemeList = await fetchThemeList();

  return (
    <MangaListClient
      initialMangaList={initialMangaList}
      initialMangaMetadata={initialMangaMetadata}
      initialAuthorList={initialAuthorList}
      initialGenreList={initialGenreList}
      initialThemeList={initialThemeList}
    />
  );
}
