import { useMemo } from "react";

import type { StatusCheck } from "@/components/data-table/DataTableStatuses";

import { useAnimeList } from "@/hooks/useAnimeList";
import { useLightNovelList } from "@/hooks/useLightNovelList";
import { useMangaList } from "@/hooks/useMangaList";

import { CalendarDaysIcon, ListIcon, NotebookPenIcon } from "lucide-react";

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
  statusChecks?: StatusCheck[];
};

const buildAnimeStatusChecks = (item: {
  title: string;
  type: string;
  fetchedEpisode: number;
  reviewText?: string | null;
  consumedAt?: Date | null;
}) => {
  const episodesFetched =
    !["Movie", "OVA"].includes(item.type) && item.fetchedEpisode > 0;
  return [
    {
      key: `${item.title}-anime-episode-status`,
      Trigger: ListIcon,
      condition: ["Movie", "OVA"].includes(item.type) || episodesFetched,
      triggerColor: { success: "text-green-600", failed: "text-destructive" },
      message: {
        success: "Episodes fetched",
        failed: "Episodes missing"
      }
    },
    {
      key: `${item.title}-anime-review-status`,
      Trigger: NotebookPenIcon,
      condition: !!item.reviewText,
      triggerColor: { success: "text-green-600", failed: "text-destructive" },
      message: { success: "Review added", failed: "Review missing" }
    },
    {
      key: `${item.title}-anime-date-status`,
      Trigger: CalendarDaysIcon,
      condition: !!item.consumedAt,
      triggerColor: { success: "text-green-600", failed: "text-destructive" },
      message: {
        success: "Consumed date set",
        failed: "Consumed date missing"
      }
    }
  ] satisfies StatusCheck[];
};

const buildMangaStatusChecks = (item: {
  title: string;
  chaptersCount?: number | null;
  volumesCount?: number | null;
  reviewText?: string | null;
  consumedAt?: Date | null;
}) =>
  [
    {
      key: `${item.title}-manga-volume-status`,
      Trigger: ListIcon,
      condition: !!item.chaptersCount && !!item.volumesCount,
      triggerColor: { success: "text-green-600", failed: "text-destructive" },
      message: {
        success: "Chapter and volume count set",
        failed: "Chapter or volume count missing"
      }
    },
    {
      key: `${item.title}-manga-review-status`,
      Trigger: NotebookPenIcon,
      condition: !!item.reviewText,
      triggerColor: { success: "text-green-600", failed: "text-destructive" },
      message: { success: "Review added", failed: "Review missing" }
    },
    {
      key: `${item.title}-manga-date-status`,
      Trigger: CalendarDaysIcon,
      condition: !!item.consumedAt,
      triggerColor: { success: "text-green-600", failed: "text-destructive" },
      message: {
        success: "Consumed date set",
        failed: "Consumed date missing"
      }
    }
  ] satisfies StatusCheck[];

const buildLightNovelStatusChecks = (item: {
  title: string;
  volumesCount?: number | null;
  volumeProgress: { consumedAt?: Date | null }[];
  reviewText?: string | null;
}) =>
  [
    {
      key: `${item.title}-ln-volume-status`,
      Trigger: ListIcon,
      condition: !!item.volumesCount,
      triggerColor: { success: "text-green-600", failed: "text-destructive" },
      message: {
        success: "Volume count set",
        failed: "Volume count missing"
      }
    },
    {
      key: `${item.title}-ln-review-status`,
      Trigger: NotebookPenIcon,
      condition: !!item.reviewText,
      triggerColor: { success: "text-green-600", failed: "text-destructive" },
      message: { success: "Review added", failed: "Review missing" }
    },
    {
      key: `${item.title}-ln-date-status`,
      Trigger: CalendarDaysIcon,
      condition:
        !!item.volumesCount && item.volumeProgress.every((v) => v.consumedAt),
      triggerColor: { success: "text-green-600", failed: "text-destructive" },
      message: {
        success: "All consumed date set",
        failed: "Some consumed date missing"
      }
    }
  ] satisfies StatusCheck[];

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
        subtitle: item.type,
        statusChecks: buildAnimeStatusChecks(item)
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
        subtitle: `${item.chaptersCount ?? 0} ch / ${item.volumesCount ?? 0} vol`,
        statusChecks: buildMangaStatusChecks(item)
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
        subtitle: `${item.volumesCount ?? 0} volumes`,
        statusChecks: buildLightNovelStatusChecks(item)
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
