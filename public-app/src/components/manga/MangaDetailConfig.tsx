"use client";

import MangaDetailScoresCard from "@/components/manga/MangaDetailScoresCard";
import MediaDetailPage from "@/components/media-detail/MediaDetailPage";
import { buildMediaDetailReviewTab } from "@/components/media-detail/buildMediaDetailReviewTab";

import { useMangaDetailPage } from "@/hooks/useMangaDetailPage";

import { type MangaDetail as MangaDetailData } from "@/types/manga.type";
import { type MediaDetailClientConfig } from "@/types/media-detail.type";

import { pickMediaImageSrc } from "@/lib/media-images";
import {
  buildMangaScoreCriteria,
  buildMediaGenreTags,
  formatMangaChaptersLabel,
  formatNamedEntityLabels
} from "@/lib/media-detail-helpers";

import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  NotepadTextIcon,
  UserIcon
} from "lucide-react";

const mangaDetailConfig: MediaDetailClientConfig<
  MangaDetailData,
  ReturnType<typeof useMangaDetailPage>
> = {
  tabHighlightLayoutId: "manga-detail-tab-highlight",
  defaultTab: "review",
  useDetailPage: useMangaDetailPage,
  selectDetail: (pageState) => pageState.mangaDetail,
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
          key: "chapters",
          icon: BookOpenIcon,
          label: formatMangaChaptersLabel(detail.chaptersCount)
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
  renderScoresCard: (detail) => <MangaDetailScoresCard mangaDetail={detail} />,
  buildTabs: (detail, spoilerState) => [
    {
      value: "review",
      label: "My Review",
      Icon: NotepadTextIcon,
      content: buildMediaDetailReviewTab(
        detail.review,
        buildMangaScoreCriteria,
        spoilerState
      )
    }
  ]
};

type MangaDetailProps = {
  id: number;
};

export default function MangaDetail({ id }: MangaDetailProps) {
  return <MediaDetailPage id={id} config={mangaDetailConfig} />;
}
