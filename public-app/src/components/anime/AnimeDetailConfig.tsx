"use client";

import AnimeDetailEpisodesTab from "@/components/anime/AnimeDetailEpisodesTab";
import AnimeDetailScoresCard from "@/components/anime/AnimeDetailScoresCard";
import MediaDetailPage from "@/components/media-detail/MediaDetailPage";
import { buildMediaDetailReviewTab } from "@/components/media-detail/buildMediaDetailReviewTab";

import { useAnimeDetailPage } from "@/hooks/useAnimeDetailPage";

import { type AnimeDetail as AnimeDetailData } from "@/types/anime.type";
import { type MediaDetailClientConfig } from "@/types/media-detail.type";

import { pickMediaImageSrc } from "@/lib/media-images";
import {
  buildAnimeScoreCriteria,
  buildMediaGenreTags,
  formatNamedEntityLabels,
  getAnimeEpisodeCount
} from "@/lib/media-detail-helpers";

import {
  Building2Icon,
  CalendarIcon,
  ClockIcon,
  LayersIcon,
  ListIcon,
  NotepadTextIcon
} from "lucide-react";

const animeDetailConfig: MediaDetailClientConfig<
  AnimeDetailData,
  ReturnType<typeof useAnimeDetailPage>
> = {
  tabHighlightLayoutId: "anime-detail-tab-highlight",
  defaultTab: "episodes",
  useDetailPage: useAnimeDetailPage,
  selectDetail: (pageState) => pageState.animeDetail,
  selectSynopsis: (detail) => detail.synopsis,
  buildTopContent: (detail, pageState) => {
    const totalEpisodeCount = getAnimeEpisodeCount(detail);
    const studioLabel = formatNamedEntityLabels(detail.studios);

    return {
      title: detail.title,
      titleJapanese: detail.titleJapanese,
      genreTags: buildMediaGenreTags(detail),
      posterUrl: pickMediaImageSrc(detail.images),
      trailerEmbedUrl: pageState.embedURL,
      metaItems: [
        {
          key: "aired",
          icon: CalendarIcon,
          label: detail.aired
        },
        {
          key: "duration",
          icon: ClockIcon,
          label: detail.duration
        },
        {
          key: "episodes",
          icon: LayersIcon,
          label: `${totalEpisodeCount} Episodes`
        }
      ],
      footerMeta: studioLabel
        ? {
            key: "studios",
            icon: Building2Icon,
            label: studioLabel
          }
        : undefined
    };
  },
  renderScoresCard: (detail) => <AnimeDetailScoresCard animeDetail={detail} />,
  buildTabs: (detail, spoilerState) => {
    const totalEpisodeCount = getAnimeEpisodeCount(detail);

    return [
      {
        value: "episodes",
        label: `Episodes (${totalEpisodeCount})`,
        Icon: ListIcon,
        content: <AnimeDetailEpisodesTab episodes={detail.episodes} />
      },
      {
        value: "review",
        label: "My Review",
        Icon: NotepadTextIcon,
        content: buildMediaDetailReviewTab(
          detail.review,
          buildAnimeScoreCriteria,
          spoilerState
        )
      }
    ];
  }
};

type AnimeDetailProps = {
  id: number;
};

export default function AnimeDetail({ id }: AnimeDetailProps) {
  return <MediaDetailPage id={id} config={animeDetailConfig} />;
}
