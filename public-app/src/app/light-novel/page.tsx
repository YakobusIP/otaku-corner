import {
  authorService,
  genreService,
  themeService
} from "@/services/entity.service";
import { fetchAllLightNovelService } from "@/services/lightnovel.service";

import GeneralFooter from "@/components/GeneralFooter";
import { LightNovelProvider } from "@/components/context/LightNovelContext";
import LightNovelFilterSortSheet from "@/components/light-novel/LightNovelFilterSortSheet";
import LightNovelListSection from "@/components/light-novel/LightNovelListSection";
import LightNovelSearch from "@/components/light-novel/LightNovelSearch";

import { MetadataResponse } from "@/types/api.type";
import { AuthorEntity, GenreEntity, ThemeEntity } from "@/types/entity.type";
import type {
  LightNovelFilterSort,
  LightNovelList
} from "@/types/lightnovel.type";

import { SORT_ORDER } from "@/lib/enums";

import { Metadata } from "next";
import { redirect } from "next/navigation";

const PAGINATION_SIZE = 15;

export const metadata: Metadata = {
  title: "Light Novel Collection | Otaku Corner",
  description:
    "Explore bearking58's selection of light novels, accompanied by sincere reviews and ratings. Discover captivating narratives and avoid the letdowns with informed opinions.",
  alternates: {
    canonical: "/light-novel"
  }
};

type SearchParams = {
  searchParams: Promise<
    { page?: string | undefined; q?: string } & LightNovelFilterSort
  >;
};

export default async function Page({ searchParams }: SearchParams) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const sortBy = params.sortBy || "title";
  const sortOrder = params.sortOrder || SORT_ORDER.ASCENDING;
  const { page: _page, q: query, ...initialLightNovelFilterSort } = params;

  const fetchLightNovelList = async (): Promise<
    [LightNovelList[], MetadataResponse]
  > => {
    const response = await fetchAllLightNovelService(
      page,
      PAGINATION_SIZE,
      query,
      sortBy,
      sortOrder,
      initialLightNovelFilterSort.filterAuthor,
      initialLightNovelFilterSort.filterGenre,
      initialLightNovelFilterSort.filterTheme,
      initialLightNovelFilterSort.filterProgressStatus,
      initialLightNovelFilterSort.filterMALScore,
      initialLightNovelFilterSort.filterPersonalScore
    );
    if (response.success) {
      return [response.data.data, response.data.metadata];
    } else {
      console.error("Error on fetching light novel list:", response.error);
      redirect("/fetch-error");
    }
  };

  const fetchAuthorList = async () => {
    const response = await authorService.fetchAll<AuthorEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      console.error("Error on fetching author list:", response.error);
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

  const fetchThemeList = async () => {
    const response = await themeService.fetchAll<ThemeEntity[]>();
    if (response.success) {
      return response.data;
    } else {
      console.error("Error on fetching theme list:", response.error);
      redirect("/fetch-error");
    }
  };

  const [initialLightNovelList, initialLightNovelMetadata] =
    await fetchLightNovelList();
  const initialAuthorList = await fetchAuthorList();
  const initialGenreList = await fetchGenreList();
  const initialThemeList = await fetchThemeList();

  return (
    <LightNovelProvider>
      <div className="flex flex-col min-h-[100dvh]">
        <LightNovelSearch initialQuery={query || ""} />
        <main className="container py-4 xl:py-12 px-4 md:px-6 flex flex-col flex-1">
          <LightNovelFilterSortSheet
            authorList={initialAuthorList}
            genreList={initialGenreList}
            themeList={initialThemeList}
          />
          <LightNovelListSection
            initialLightNovelList={initialLightNovelList}
            initialLightNovelMetadata={initialLightNovelMetadata}
          />
        </main>
        <GeneralFooter />
      </div>
    </LightNovelProvider>
  );
}
