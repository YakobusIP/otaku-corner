"use client";

import LightNovelDetailScoresCard from "@/features/media-detail/domains/light-novel/LightNovelDetailScoresCard";
import MediaDetailPage from "@/features/media-detail/components/MediaDetailPage";
import { buildMediaDetailReviewTab } from "@/features/media-detail/components/buildMediaDetailReviewTab";

import { useLightNovelDetailPage } from "@/features/media-detail/hooks/useLightNovelDetailPage";

import { type LightNovelDetail as LightNovelDetailData } from "@/types/lightnovel.type";
import { type MediaDetailClientConfig } from "@/types/media-detail.type";

import { pickMediaImageSrc } from "@/features/media-detail/lib/media-images";
import {
  buildLightNovelScoreCriteria,
  buildMediaGenreTags,
  formatLightNovelVolumesLabel,
  formatNamedEntityLabels
} from "@/features/media-detail/lib/media-detail-helpers";

import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  NotepadTextIcon,
  UserIcon
} from "lucide-react";

const lightNovelDetailConfig: MediaDetailClientConfig<
  LightNovelDetailData,
  ReturnType<typeof useLightNovelDetailPage>
> = {
  tabHighlightLayoutId: "light-novel-detail-tab-highlight",
  defaultTab: "review",
  useDetailPage: useLightNovelDetailPage,
  selectDetail: (pageState) => pageState.lightNovelDetail,
  selectSynopsis: (detail) => detail.synopsis,
  buildTopContent: (detail) => {
    const authorLabel = formatNamedEntityLabels(detail.authors);

    return {
      title: detail.title,
      titleJapanese: detail.titleJapanese,
      genreTags: buildMediaGenreTags(detail),
      posterUrl: pickMediaImageSrc(detail.images),
      metaItems: [
        {
          key: "published",
          icon: CalendarIcon,
          label: detail.published
        },
        {
          key: "volumes",
          icon: BookOpenIcon,
          label: formatLightNovelVolumesLabel(detail.volumesCount)
        },
        {
          key: "status",
          icon: ClockIcon,
          label: detail.status
        }
      ],
      footerMeta: authorLabel
        ? {
            key: "authors",
            icon: UserIcon,
            label: authorLabel
          }
        : undefined
    };
  },
  renderScoresCard: (detail) => (
    <LightNovelDetailScoresCard lightNovelDetail={detail} />
  ),
  buildTabs: (detail, spoilerState) => [
    {
      value: "review",
      label: "My Review",
      Icon: NotepadTextIcon,
      content: buildMediaDetailReviewTab(
        detail.review,
        buildLightNovelScoreCriteria,
        spoilerState
      )
    }
  ]
};

type LightNovelDetailProps = {
  id: number;
};

export default function LightNovelDetail({ id }: LightNovelDetailProps) {
  return <MediaDetailPage id={id} config={lightNovelDetailConfig} />;
}
