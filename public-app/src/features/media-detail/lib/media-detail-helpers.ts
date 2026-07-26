type NamedEntity = {
  name: string;
};

type GenreThemeDetail = {
  genres: NamedEntity[];
  themes: NamedEntity[];
};

type AnimeEpisodeCountSource = {
  episodesCount?: number | null;
  episodes: unknown[];
};

export type MediaDetailReviewFields = {
  reviewText?: string | null;
  personalScore?: number | null;
};

export const formatNamedEntityLabels = (entities: NamedEntity[]) =>
  entities.map((entity) => entity.name).join(", ");

export const buildMediaGenreTags = (detail: GenreThemeDetail) => [
  ...detail.genres.map((genre) => genre.name),
  ...detail.themes.map((theme) => theme.name)
];

export const getAnimeEpisodeCount = (detail: AnimeEpisodeCountSource) =>
  detail.episodesCount ?? detail.episodes.length;

export const getSeasonProgressPercent = (
  watchedCount: number,
  totalCount: number
) => {
  if (totalCount <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((watchedCount / totalCount) * 100));
};

export type MediaScoreCriterion = {
  title: string;
  score: number | null | undefined;
};

type AnimeReviewRatings = {
  storylineRating?: number | null;
  qualityRating?: number | null;
  voiceActingRating?: number | null;
  soundTrackRating?: number | null;
  charDevelopmentRating?: number | null;
};

type MangaReviewRatings = {
  storylineRating?: number | null;
  artStyleRating?: number | null;
  charDevelopmentRating?: number | null;
  worldBuildingRating?: number | null;
  originalityRating?: number | null;
};

type LightNovelReviewRatings = {
  storylineRating?: number | null;
  worldBuildingRating?: number | null;
  writingStyleRating?: number | null;
  charDevelopmentRating?: number | null;
  originalityRating?: number | null;
};

export const buildAnimeScoreCriteria = (
  review: AnimeReviewRatings | null | undefined
): MediaScoreCriterion[] => {
  if (!review) {
    return [];
  }

  return [
    { title: "Storyline", score: review.storylineRating },
    { title: "Animation Quality", score: review.qualityRating },
    { title: "Voice Acting", score: review.voiceActingRating },
    { title: "Soundtrack", score: review.soundTrackRating },
    {
      title: "Character Development",
      score: review.charDevelopmentRating
    }
  ];
};

export const buildMangaScoreCriteria = (
  review: MangaReviewRatings | null | undefined
): MediaScoreCriterion[] => {
  if (!review) {
    return [];
  }

  return [
    { title: "Storyline", score: review.storylineRating },
    { title: "Art Style", score: review.artStyleRating },
    {
      title: "Character Development",
      score: review.charDevelopmentRating
    },
    { title: "World Building", score: review.worldBuildingRating },
    { title: "Originality", score: review.originalityRating }
  ];
};

export const buildLightNovelScoreCriteria = (
  review: LightNovelReviewRatings | null | undefined
): MediaScoreCriterion[] => {
  if (!review) {
    return [];
  }

  return [
    { title: "Storyline", score: review.storylineRating },
    { title: "World Building", score: review.worldBuildingRating },
    { title: "Writing Style", score: review.writingStyleRating },
    {
      title: "Character Development",
      score: review.charDevelopmentRating
    },
    { title: "Originality", score: review.originalityRating }
  ];
};

export const getScoreBarPercent = (score: number | null | undefined) => {
  if (score == null || score < 1) {
    return 0;
  }

  return Math.min(100, Math.round((score / 10) * 100));
};

export const formatMangaChaptersLabel = (chaptersCount?: number | null) => {
  if (chaptersCount == null || chaptersCount <= 0) {
    return "Unknown chapters";
  }

  return `${chaptersCount} Chapters`;
};

export const formatMangaVolumesLabel = (volumesCount?: number | null) => {
  if (volumesCount == null || volumesCount <= 0) {
    return "Unknown volumes";
  }

  return `${volumesCount} Volumes`;
};

export const formatLightNovelVolumesLabel = (volumesCount?: number | null) => {
  if (volumesCount == null || volumesCount <= 0) {
    return "Unknown volumes";
  }

  return `${volumesCount} Volume${volumesCount === 1 ? "" : "s"}`;
};
