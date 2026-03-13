import { useMemo } from "react";

import { useAnimeList } from "@/hooks/useAnimeList";
import { useLightNovelList } from "@/hooks/useLightNovelList";
import { useMangaList } from "@/hooks/useMangaList";

type CombinedItem = {
  mediaType: "anime" | "manga" | "lightNovel";
  id: number;
  slug: string;
  title: string;
  titleJapanese: string;
  score: number;
  personalScore?: number | null;
  progressStatus: string;
  imageUrl?: string;
  subtitle?: string;
};

export const useCombinedMediaList = (enabled = true) => {
  const animeQuery = useAnimeList(enabled);
  const mangaQuery = useMangaList(enabled);
  const lightNovelQuery = useLightNovelList(enabled);

  const items = useMemo<CombinedItem[]>(() => {
    const anime =
      animeQuery.data?.data.map((item) => ({
        mediaType: "anime" as const,
        id: item.id,
        slug: item.slug,
        title: item.title,
        titleJapanese: item.titleJapanese,
        score: item.score,
        personalScore: item.personalScore,
        progressStatus: item.progressStatus,
        imageUrl: item.images.large_image_url ?? item.images.image_url,
        subtitle: item.type
      })) ?? [];

    const manga =
      mangaQuery.data?.data.map((item) => ({
        mediaType: "manga" as const,
        id: item.id,
        slug: item.slug,
        title: item.title,
        titleJapanese: item.titleJapanese,
        score: item.score,
        personalScore: item.personalScore,
        progressStatus: item.progressStatus,
        imageUrl: item.images.large_image_url ?? item.images.image_url,
        subtitle: `${item.chaptersCount ?? 0} ch / ${item.volumesCount ?? 0} vol`
      })) ?? [];

    const lightNovel =
      lightNovelQuery.data?.data.map((item) => ({
        mediaType: "lightNovel" as const,
        id: item.id,
        slug: item.slug,
        title: item.title,
        titleJapanese: item.titleJapanese,
        score: item.score,
        personalScore: item.personalScore,
        progressStatus: item.progressStatus,
        imageUrl: item.images.large_image_url ?? item.images.image_url,
        subtitle: `${item.volumesCount ?? 0} volumes`
      })) ?? [];

    return [...anime, ...manga, ...lightNovel];
  }, [animeQuery.data, lightNovelQuery.data, mangaQuery.data]);

  return {
    items,
    isLoading:
      animeQuery.isLoading || mangaQuery.isLoading || lightNovelQuery.isLoading,
    error: animeQuery.error || mangaQuery.error || lightNovelQuery.error
  };
};
