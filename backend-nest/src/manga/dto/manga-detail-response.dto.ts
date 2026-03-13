import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { ProgressStatus } from "@prisma/client";

export class MangaAuthorItemDto {
  @ApiProperty({ description: "Author ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Author name", example: "Miura, Kentarou" })
  name: string;
}

export class MangaGenreItemDto {
  @ApiProperty({ description: "Genre ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Genre name", example: "Action" })
  name: string;
}

export class MangaThemeItemDto {
  @ApiProperty({ description: "Theme ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Theme name", example: "Military" })
  name: string;
}

export class MangaReviewItemDto {
  @ApiProperty({ description: "Review ID", example: 1 })
  id: number;

  @ApiPropertyOptional({ description: "Review text" })
  reviewText: string | null;

  @ApiPropertyOptional({ description: "Storyline rating", example: 8 })
  storylineRating: number | null;

  @ApiPropertyOptional({ description: "Art style rating", example: 9 })
  artStyleRating: number | null;

  @ApiPropertyOptional({
    description: "Character development rating",
    example: 7
  })
  charDevelopmentRating: number | null;

  @ApiPropertyOptional({ description: "World building rating", example: 8 })
  worldBuildingRating: number | null;

  @ApiPropertyOptional({ description: "Originality rating", example: 9 })
  originalityRating: number | null;

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

export class MangaDetailResponseDto {
  @ApiProperty({ description: "Manga ID", example: 1 })
  id: number;

  @ApiProperty({ description: "URL slug", example: "berserk" })
  slug: string;

  @ApiProperty({ description: "Publishing status", example: "Finished" })
  status: string;

  @ApiProperty({ description: "Manga title", example: "Berserk" })
  title: string;

  @ApiProperty({
    description: "Japanese title",
    example: "ベルセルク"
  })
  titleJapanese: string;

  @ApiProperty({
    description: "Title synonyms",
    example: "Berserk: The Prototype"
  })
  titleSynonyms: string;

  @ApiProperty({
    description: "Published date range",
    example: "Aug 25, 1989 to Sep 10, 2021"
  })
  published: string;

  @ApiPropertyOptional({ description: "Number of chapters", example: 364 })
  chaptersCount: number | null;

  @ApiPropertyOptional({ description: "Number of volumes", example: 41 })
  volumesCount: number | null;

  @ApiPropertyOptional({ description: "MAL score", example: 9.47 })
  score: number | null;

  @ApiProperty({
    description: "Image URLs",
    example: { image_url: "https://example.com/image.jpg" }
  })
  images: object;

  @ApiProperty({ description: "Synopsis text" })
  synopsis: string;

  @ApiProperty({
    description: "MAL URL",
    example: "https://myanimelist.net/manga/2/Berserk"
  })
  malUrl: string;

  @ApiProperty({ description: "Created at" })
  createdAt: Date;

  @ApiProperty({ description: "Updated at" })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: "Manga review",
    type: MangaReviewItemDto
  })
  review: MangaReviewItemDto | null;

  @ApiProperty({
    description: "Authors",
    type: [MangaAuthorItemDto]
  })
  authors: MangaAuthorItemDto[];

  @ApiProperty({
    description: "Genres",
    type: [MangaGenreItemDto]
  })
  genres: MangaGenreItemDto[];

  @ApiProperty({
    description: "Themes",
    type: [MangaThemeItemDto]
  })
  themes: MangaThemeItemDto[];
}
