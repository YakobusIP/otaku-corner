import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { ProgressStatus } from "@prisma/client";

export class AnimeGenreItemDto {
  @ApiProperty({ description: "Genre ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Genre name", example: "Action" })
  name: string;
}

export class AnimeStudioItemDto {
  @ApiProperty({ description: "Studio ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Studio name", example: "Sunrise" })
  name: string;
}

export class AnimeThemeItemDto {
  @ApiProperty({ description: "Theme ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Theme name", example: "Space" })
  name: string;
}

export class AnimeEpisodeItemDto {
  @ApiProperty({ description: "Episode ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Aired date", example: "2024-01-01" })
  aired: string;

  @ApiProperty({ description: "Episode number", example: 1 })
  number: number;

  @ApiProperty({ description: "Episode title", example: "The Beginning" })
  title: string;

  @ApiPropertyOptional({ description: "Episode title in Japanese" })
  titleJapanese: string | null;

  @ApiPropertyOptional({ description: "Episode title in Romaji" })
  titleRomaji: string | null;
}

export class AnimeReviewItemDto {
  @ApiProperty({ description: "Review ID", example: 1 })
  id: number;

  @ApiPropertyOptional({ description: "Review text" })
  reviewText: string | null;

  @ApiPropertyOptional({ description: "Storyline rating", example: 8 })
  storylineRating: number | null;

  @ApiPropertyOptional({ description: "Quality rating", example: 9 })
  qualityRating: number | null;

  @ApiPropertyOptional({ description: "Voice acting rating", example: 8 })
  voiceActingRating: number | null;

  @ApiPropertyOptional({ description: "Sound track rating", example: 10 })
  soundTrackRating: number | null;

  @ApiPropertyOptional({
    description: "Character development rating",
    example: 7
  })
  charDevelopmentRating: number | null;

  @ApiPropertyOptional({ description: "Personal score", example: 9.2 })
  personalScore: number | null;

  @ApiPropertyOptional({
    description: "Progress status",
    enum: ProgressStatus
  })
  progressStatus: ProgressStatus;

  @ApiPropertyOptional({ description: "Date consumed" })
  consumedAt: Date | null;

  @ApiProperty({ description: "Created at" })
  createdAt: Date;

  @ApiProperty({ description: "Updated at" })
  updatedAt: Date;
}

export class AnimeDetailResponseDto {
  @ApiProperty({ description: "Anime ID", example: 1 })
  id: number;

  @ApiProperty({ description: "URL slug", example: "cowboy-bebop" })
  slug: string;

  @ApiProperty({ description: "Anime type", example: "TV" })
  type: string;

  @ApiProperty({ description: "Airing status", example: "Finished Airing" })
  status: string;

  @ApiProperty({ description: "Age rating", example: "R" })
  rating: string;

  @ApiPropertyOptional({ description: "Season", example: "spring" })
  season: string | null;

  @ApiProperty({ description: "Anime title", example: "Cowboy Bebop" })
  title: string;

  @ApiProperty({
    description: "Japanese title",
    example: "カウボーイビバップ"
  })
  titleJapanese: string;

  @ApiProperty({ description: "Title synonyms", example: "CB" })
  titleSynonyms: string;

  @ApiProperty({ description: "Source material", example: "Original" })
  source: string;

  @ApiProperty({
    description: "Aired date range",
    example: "Apr 3, 1998 to Apr 24, 1999"
  })
  aired: string;

  @ApiProperty({
    description: "Broadcast schedule",
    example: "Saturdays at 01:00 (JST)"
  })
  broadcast: string;

  @ApiPropertyOptional({ description: "Number of episodes", example: 26 })
  episodesCount: number | null;

  @ApiProperty({ description: "Episode duration", example: "24 min per ep" })
  duration: string;

  @ApiPropertyOptional({ description: "MAL score", example: 8.78 })
  score: number | null;

  @ApiProperty({
    description: "Image URLs",
    example: { image_url: "https://example.com/image.jpg" }
  })
  images: object;

  @ApiProperty({ description: "Synopsis text" })
  synopsis: string;

  @ApiPropertyOptional({ description: "Trailer URL" })
  trailer: string | null;

  @ApiProperty({
    description: "MAL URL",
    example: "https://myanimelist.net/anime/1/Cowboy_Bebop"
  })
  malUrl: string;

  @ApiProperty({ description: "Created at" })
  createdAt: Date;

  @ApiProperty({ description: "Updated at" })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: "Anime review",
    type: AnimeReviewItemDto
  })
  review: AnimeReviewItemDto | null;

  @ApiProperty({
    description: "Genres",
    type: [AnimeGenreItemDto]
  })
  genres: AnimeGenreItemDto[];

  @ApiProperty({
    description: "Studios",
    type: [AnimeStudioItemDto]
  })
  studios: AnimeStudioItemDto[];

  @ApiProperty({
    description: "Themes",
    type: [AnimeThemeItemDto]
  })
  themes: AnimeThemeItemDto[];

  @ApiProperty({
    description: "Episodes",
    type: [AnimeEpisodeItemDto]
  })
  episodes: AnimeEpisodeItemDto[];
}
