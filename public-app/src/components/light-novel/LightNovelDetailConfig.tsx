"use client";

import LightNovelDetailScoresCard from "@/components/light-novel/LightNovelDetailScoresCard";
import MediaDetailPage from "@/components/media-detail/MediaDetailPage";
import { buildMediaDetailReviewTab } from "@/components/media-detail/buildMediaDetailReviewTab";

import { useLightNovelDetailPage } from "@/hooks/useLightNovelDetailPage";

import { type LightNovelDetail as LightNovelDetailData } from "@/types/lightnovel.type";
import { type MediaDetailClientConfig } from "@/types/media-detail.type";

import { pickMediaImageSrc } from "@/lib/media-images";
import {
  buildLightNovelScoreCriteria,
  buildMediaGenreTags,
  formatLightNovelVolumesLabel,
  formatNamedEntityLabels
} from "@/lib/media-detail-helpers";

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
