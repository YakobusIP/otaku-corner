export type PublicMediaTypeId = "anime" | "manga" | "lightNovel";

export type HomeProgressChartTab = "all" | PublicMediaTypeId;

export type PublicMediaConsumptionDataKey =
  | "animeCount"
  | "mangaCount"
  | "lightNovelCount";

type PublicMediaTypeConfig = {
  id: PublicMediaTypeId;
  listHref: string;
  detailPathSegment: string;
  navLabel: string;
  listPageLabel: string;
  reviewBadgeLabel: string;
  chartPieLegendName: string;
  chartLineName: string;
  chartLineDataKey: PublicMediaConsumptionDataKey;
  allTimeCountKey: "animeCount" | "mangaCount" | "lightNovelCount";
  chartColor: string;
  reviewBadgeClass: string;
  heroCounterIconBg: string;
  heroCounterLabel: string;
};

export const PUBLIC_MEDIA_TYPES: PublicMediaTypeId[] = [
  "anime",
  "manga",
  "lightNovel"
];

export const PUBLIC_MEDIA_TYPE_CONFIG: Record<
  PublicMediaTypeId,
  PublicMediaTypeConfig
> = {
  anime: {
    id: "anime",
    listHref: "/anime",
    detailPathSegment: "anime",
    navLabel: "Anime",
    listPageLabel: "Anime List",
    reviewBadgeLabel: "Anime",
    chartPieLegendName: "Anime",
    chartLineName: "Anime",
    chartLineDataKey: "animeCount",
    allTimeCountKey: "animeCount",
    chartColor: "hsl(340 78% 58%)",
    reviewBadgeClass: "bg-rose-100 text-rose-700 ring-rose-200/60",
    heroCounterIconBg: "bg-rose-100 text-rose-500",
    heroCounterLabel: "Anime Watched"
  },
  manga: {
    id: "manga",
    listHref: "/manga",
    detailPathSegment: "manga",
    navLabel: "Manga",
    listPageLabel: "Manga List",
    reviewBadgeLabel: "Manga",
    chartPieLegendName: "Manga",
    chartLineName: "Manga",
    chartLineDataKey: "mangaCount",
    allTimeCountKey: "mangaCount",
    chartColor: "hsl(268 78% 66%)",
    reviewBadgeClass: "bg-violet-100 text-violet-700 ring-violet-200/60",
    heroCounterIconBg: "bg-teal-100 text-teal-600",
    heroCounterLabel: "Manga Read"
  },
  lightNovel: {
    id: "lightNovel",
    listHref: "/light-novel",
    detailPathSegment: "light-novel",
    navLabel: "Light Novels",
    listPageLabel: "Light Novel List",
    reviewBadgeLabel: "Light Novel",
    chartPieLegendName: "Light Novels",
    chartLineName: "Light Novels",
    chartLineDataKey: "lightNovelCount",
    allTimeCountKey: "lightNovelCount",
    chartColor: "hsl(24 92% 62%)",
    reviewBadgeClass: "bg-orange-100 text-orange-700 ring-orange-200/60",
    heroCounterIconBg: "bg-orange-100 text-orange-600",
    heroCounterLabel: "Light Novels Read"
  }
};

export const PUBLIC_MEDIA_NAV_LINKS = PUBLIC_MEDIA_TYPES.map((mediaTypeId) => {
  const config = PUBLIC_MEDIA_TYPE_CONFIG[mediaTypeId];
  return {
    href: config.listHref,
    label: config.navLabel
  };
});

export const HOME_PROGRESS_CHART_TABS: {
  value: HomeProgressChartTab;
  label: string;
}[] = [
  { value: "all", label: "All" },
  ...PUBLIC_MEDIA_TYPES.map((mediaTypeId) => {
    const config = PUBLIC_MEDIA_TYPE_CONFIG[mediaTypeId];
    return {
      value: mediaTypeId,
      label: config.chartLineName
    };
  })
];

export const buildPublicMediaDetailHref = (
  mediaTypeId: PublicMediaTypeId,
  mediaId: number,
  slug: string
) => {
  const { detailPathSegment } = PUBLIC_MEDIA_TYPE_CONFIG[mediaTypeId];
  return `/${detailPathSegment}/${mediaId}/${slug}`;
};

export const getChartPieColor = (legendName: string) => {
  const match = PUBLIC_MEDIA_TYPES.find((mediaTypeId) => {
    return (
      PUBLIC_MEDIA_TYPE_CONFIG[mediaTypeId].chartPieLegendName === legendName
    );
  });
  if (!match) {
    return PUBLIC_MEDIA_TYPE_CONFIG.anime.chartColor;
  }
  return PUBLIC_MEDIA_TYPE_CONFIG[match].chartColor;
};
