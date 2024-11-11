import {
  authorService,
  genreService,
  themeService
} from "@/services/entity.service";
import { fetchAllLightNovelService } from "@/services/lightnovel.service";

import { MetadataResponse } from "@/types/api.type";
import { AuthorEntity, GenreEntity, ThemeEntity } from "@/types/entity.type";
import type { LightNovelList } from "@/types/lightnovel.type";

import { SORT_ORDER } from "@/lib/enums";

import { redirect } from "next/navigation";

import LightNovelListClient from "./LightNovelListClient";

const START_PAGE = 1;
const PAGINATION_SIZE = 15;

export default async function Page() {
  const fetchLightNovelList = async (): Promise<
    [LightNovelList[], MetadataResponse]
  > => {
    const response = await fetchAllLightNovelService(
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

  const fetchAuthorList = async () => {
    const response = await authorService.fetchAll<AuthorEntity[]>();
    if (response.success) {
      return response.data;
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

  const fetchThemeList = async () => {
    const response = await themeService.fetchAll<ThemeEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      redirect("/fetch-error");
    }
  };

  const [initialLightNovelList, initialLightNovelMetadata] =
    await fetchLightNovelList();
  const initialAuthorList = await fetchAuthorList();
  const initialGenreList = await fetchGenreList();
  const initialThemeList = await fetchThemeList();

  return (
    <LightNovelListClient
      initialLightNovelList={initialLightNovelList}
      initialLightNovelMetadata={initialLightNovelMetadata}
      initialAuthorList={initialAuthorList}
      initialGenreList={initialGenreList}
      initialThemeList={initialThemeList}
    />
  );
}
