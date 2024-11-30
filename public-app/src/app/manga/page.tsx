import {
  authorService,
  genreService,
  themeService
} from "@/services/entity.service";
import { fetchAllMangaService } from "@/services/manga.service";

import GeneralFooter from "@/components/GeneralFooter";
import { MangaProvider } from "@/components/context/MangaContext";
import MangaFilterSortSheet from "@/components/manga/MangaFilterSortSheet";
import MangaListSection from "@/components/manga/MangaListSection";
import MangaSearch from "@/components/manga/MangaSearch";

import { MetadataResponse } from "@/types/api.type";
import { AuthorEntity, GenreEntity, ThemeEntity } from "@/types/entity.type";
import type { MangaFilterSort, MangaList } from "@/types/manga.type";

import { SORT_ORDER } from "@/lib/enums";

import { Metadata } from "next";
import { redirect } from "next/navigation";

const PAGINATION_SIZE = 15;

export const metadata: Metadata = {
  title: "Manga Collection | Otaku Corner",
  description:
    "Browse through bearking58's manga collection, featuring straightforward reviews and ratings. Find compelling stories and steer clear of the duds with helpful insights.",
  alternates: {
    canonical: "/manga"
  }
};

type SearchParams = {
  searchParams: Promise<
    { page?: string | undefined; q?: string } & MangaFilterSort
  >;
};

export default async function Page({ searchParams }: SearchParams) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const sortBy = params.sortBy || "title";
  const sortOrder = params.sortOrder || SORT_ORDER.ASCENDING;
  const { page: _page, q: query, ...initialMangaFilterSort } = params;

  const fetchMangaList = async (): Promise<[MangaList[], MetadataResponse]> => {
    const response = await fetchAllMangaService(
      page,
      PAGINATION_SIZE,
      query,
      sortBy,
      sortOrder,
      initialMangaFilterSort.filterAuthor,
      initialMangaFilterSort.filterGenre,
      initialMangaFilterSort.filterTheme,
      initialMangaFilterSort.filterProgressStatus,
      initialMangaFilterSort.filterMALScore,
      initialMangaFilterSort.filterPersonalScore
    );
    if (response.success) {
      return [response.data.data, response.data.metadata];
    } else {
      console.error("Error on fetching manga list:", response.error);
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

  const [initialMangaList, initialMangaMetadata] = await fetchMangaList();
  const initialAuthorList = await fetchAuthorList();
  const initialGenreList = await fetchGenreList();
  const initialThemeList = await fetchThemeList();

  return (
    <MangaProvider>
      <div className="flex flex-col min-h-[100dvh]">
        <MangaSearch initialQuery={query || ""} />
        <main className="container py-4 xl:py-12 px-4 md:px-6 flex flex-col flex-1">
          <MangaFilterSortSheet
            authorList={initialAuthorList}
            genreList={initialGenreList}
            themeList={initialThemeList}
          />
          <MangaListSection
            initialMangaList={initialMangaList}
            initialMangaMetadata={initialMangaMetadata}
          />
        </main>
        <GeneralFooter />
      </div>
    </MangaProvider>
  );
}
