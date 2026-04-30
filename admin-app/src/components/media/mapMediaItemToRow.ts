import type { StatusCheck } from "@/components/data-table/DataTableStatuses";

import type { MediaLibraryListItem } from "@/types/media-library.type";

import { type ProgressStatusKey } from "@/lib/enums";

import { CalendarDaysIcon, ListIcon, NotebookPenIcon } from "lucide-react";

type MediaListItemWithConsumedDate = Extract<
  MediaLibraryListItem,
  { mediaType: "anime" } | { mediaType: "manga" }
>;

const successFailedColor = {
  success: "text-green-700",
  failed: "text-destructive"
};

const createStatusCheck = (params: {
  key: string;
  Trigger: StatusCheck["Trigger"];
  condition: boolean;
  success: string;
  failed: string;
}): StatusCheck => {
  return {
    key: params.key,
    Trigger: params.Trigger,
    condition: params.condition,
    triggerColor: successFailedColor,
    message: {
      success: params.success,
      failed: params.failed
    }
  };
};

const getBaseRow = (item: MediaLibraryListItem) => {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    titleJapanese: item.titleJapanese,
    score: item.score,
    personalScore: item.personalScore,
    progressStatus: (item.progressStatus
      ? item.progressStatus
      : "") as ProgressStatusKey | "",
    imageUrl: item.images.large_image_url ?? item.images.image_url
  };
};

const createReviewCheck = (item: MediaLibraryListItem, mediaType: string) => {
  return createStatusCheck({
    key: `${item.title}-${mediaType}-review-status`,
    Trigger: NotebookPenIcon,
    condition: !!item.reviewText,
    success: "Review added",
    failed: "Review missing"
  });
};

const createConsumedDateCheck = (
  item: MediaListItemWithConsumedDate,
  mediaType: string
) => {
  return createStatusCheck({
    key: `${item.title}-${mediaType}-date-status`,
    Trigger: CalendarDaysIcon,
    condition: !!item.consumedAt,
    success: "Consumed date set",
    failed: "Consumed date missing"
  });
};

export const mapMediaItemToRow = (item: MediaLibraryListItem) => {
  const baseRow = getBaseRow(item);

  if (item.mediaType === "anime") {
    const isMovieOrOva = ["Movie", "OVA"].includes(item.type);
    const episodesFetched = !isMovieOrOva && item.fetchedEpisode > 0;

    return {
      ...baseRow,
      mediaType: "anime" as const,
      subtitle: item.type,
      statusChecks: [
        createStatusCheck({
          key: `${item.title}-anime-episode-status`,
          Trigger: ListIcon,
          condition: isMovieOrOva || episodesFetched,
          success: "Episodes fetched",
          failed: "Episodes missing"
        }),
        createReviewCheck(item, "anime"),
        createConsumedDateCheck(item, "anime")
      ]
    };
  }

  if (item.mediaType === "manga") {
    return {
      ...baseRow,
      mediaType: "manga" as const,
      subtitle: `${item.chaptersCount ?? 0} ch / ${item.volumesCount ?? 0} vol`,
      statusChecks: [
        createStatusCheck({
          key: `${item.title}-manga-volume-status`,
          Trigger: ListIcon,
          condition: !!item.chaptersCount && !!item.volumesCount,
          success: "Chapter and volume count set",
          failed: "Chapter or volume count missing"
        }),
        createReviewCheck(item, "manga"),
        createConsumedDateCheck(item, "manga")
      ]
    };
  }

  return {
    ...baseRow,
    mediaType: "lightNovel" as const,
    subtitle: `${item.volumesCount ?? 0} volumes`,
    statusChecks: [
      createStatusCheck({
        key: `${item.title}-ln-volume-status`,
        Trigger: ListIcon,
        condition: !!item.volumesCount,
        success: "Volume count set",
        failed: "Volume count missing"
      }),
      createReviewCheck(item, "ln"),
      createStatusCheck({
        key: `${item.title}-ln-date-status`,
        Trigger: CalendarDaysIcon,
        condition:
          !!item.volumesCount && item.volumeProgress.every((v) => v.consumedAt),
        success: "All consumed date set",
        failed: "Some consumed date missing"
      })
    ]
  };
};
