import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { ProgressStatus } from "@prisma/client";

class RelatedEntityDto {
  @ApiProperty({ description: "Entity ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Entity name", example: "Action" })
  name: string;
}

class LightNovelReviewDetailDto {
  @ApiProperty({ description: "Review ID", example: 1 })
  id: number;

  @ApiPropertyOptional({ description: "Review text" })
  reviewText: string | null;

  @ApiPropertyOptional({
    description: "Storyline rating (1-10)",
    example: 8
  })
  storylineRating: number | null;

  @ApiPropertyOptional({
    description: "World building rating (1-10)",
    example: 9
  })
  worldBuildingRating: number | null;

  @ApiPropertyOptional({
    description: "Writing style rating (1-10)",
    example: 8
  })
  writingStyleRating: number | null;

  @ApiPropertyOptional({
    description: "Character development rating (1-10)",
    example: 7
  })
  charDevelopmentRating: number | null;

  @ApiPropertyOptional({
    description: "Originality rating (1-10)",
    example: 8
  })
  originalityRating: number | null;

  @ApiPropertyOptional({ description: "Personal score", example: 8.5 })
  personalScore: number | null;

  @ApiProperty({
    description: "Progress status",
    enum: ProgressStatus,
    example: ProgressStatus.PLANNED
  })
  progressStatus: ProgressStatus;
}

class VolumeProgressDetailDto {
  @ApiProperty({ description: "Volume progress ID", example: 1 })
  id: number;

  @ApiProperty({ description: "Volume number", example: 1 })
  volumeNumber: number;

  @ApiPropertyOptional({
    description: "Date consumed",
    example: "2024-06-15",
    nullable: true
  })
  consumedAt: Date | null;
}

export class LightNovelDetailResponseDto {
  @ApiProperty({ description: "Light novel ID", example: 1 })
  id: number;

  @ApiProperty({ description: "URL slug", example: "sword-art-online" })
  slug: string;

  @ApiProperty({ description: "Publishing status", example: "Finished" })
  status: string;

  @ApiProperty({
    description: "Light novel title",
    example: "Sword Art Online"
  })
  title: string;

  @ApiProperty({
    description: "Japanese title",
    example: "ソードアート・オンライン"
  })
  titleJapanese: string;

  @ApiProperty({ description: "Title synonyms", example: "SAO" })
  titleSynonyms: string;

  @ApiProperty({
    description: "Published date range",
    example: "Apr 10, 2009 to ?"
  })
  published: string;

  @ApiPropertyOptional({ description: "Number of volumes", example: 27 })
  volumesCount: number | null;

  @ApiPropertyOptional({ description: "MAL score", example: 7.55 })
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
    example: "https://myanimelist.net/manga/21479/Sword_Art_Online"
  })
  malUrl: string;

  @ApiProperty({ description: "Created at" })
  createdAt: Date;

  @ApiProperty({ description: "Updated at" })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: "Review details",
    type: LightNovelReviewDetailDto
  })
  review: LightNovelReviewDetailDto | null;

  @ApiProperty({
    description: "Volume progress entries",
    type: [VolumeProgressDetailDto]
  })
  volumeProgress: VolumeProgressDetailDto[];

  @ApiProperty({
    description: "Authors",
    type: [RelatedEntityDto]
  })
  authors: RelatedEntityDto[];

  @ApiProperty({
    description: "Genres",
    type: [RelatedEntityDto]
  })
  genres: RelatedEntityDto[];

  @ApiProperty({
    description: "Themes",
    type: [RelatedEntityDto]
  })
  themes: RelatedEntityDto[];
}
