import LightNovelListClient from "@/app/light-novel/LightNovelListClient";

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

import { Metadata } from "next";
import { redirect } from "next/navigation";

const START_PAGE = 1;
const PAGINATION_SIZE = 15;

export const metadata: Metadata = {
  title: "Light Novel Collection | Otaku Corner",
  description:
    "Explore bearking58's selection of light novels, accompanied by sincere reviews and ratings. Discover captivating narratives and avoid the letdowns with informed opinions."
};

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
