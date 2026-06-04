import type { AnimeList } from "@/types/anime.type";
import type { LightNovelList } from "@/types/light-novel.type";
import type { MangaList } from "@/types/manga.type";

import { SORT_ORDER } from "@/lib/enums";

export type MediaLibraryListItem =
  | (AnimeList & { mediaType: "anime" })
  | (MangaList & { mediaType: "manga" })
  | (LightNovelList & { mediaType: "lightNovel" });

export type MediaLibraryListRequest = {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: SORT_ORDER;
  filterQuery?: string;
  filterProgressStatus?: string;
  filterGenre?: number;
  filterStudio?: number;
  filterTheme?: number;
  filterAuthor?: number;
  filterType?: string;
  filterMALScore?: string;
  filterPersonalScore?: string;
  filterStatusCheck?: string;
};
