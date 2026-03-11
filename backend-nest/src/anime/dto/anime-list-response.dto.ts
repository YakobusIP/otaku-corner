import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProgressStatus } from "@prisma/client";

export class AnimeListResponseDto {
  @ApiProperty({ description: "Anime ID", example: 1 })
  id: number;

  @ApiProperty({ description: "URL slug", example: "cowboy-bebop" })
  slug: string;

  @ApiProperty({ description: "Anime title", example: "Cowboy Bebop" })
  title: string;

  @ApiProperty({
    description: "Japanese title",
    example: "カウボーイビバップ",
  })
  titleJapanese: string;

  @ApiProperty({
    description: "Image URLs",
    example: { image_url: "https://example.com/image.jpg" },
  })
  images: object;

  @ApiProperty({ description: "Airing status", example: "Finished Airing" })
  status: string;

  @ApiProperty({ description: "Anime type", example: "TV" })
  type: string;

  @ApiProperty({ description: "MAL score", example: 8.78, nullable: true })
  score: number | null;

  @ApiProperty({ description: "Season", example: "spring", nullable: true })
  season: string | null;

  @ApiProperty({
    description: "Aired date range",
    example: "Apr 3, 1998 to Apr 24, 1999",
  })
  aired: string;

  @ApiProperty({ description: "Age rating", example: "R" })
  rating: string;

  @ApiPropertyOptional({ description: "Review text" })
  reviewText?: string | null;

  @ApiPropertyOptional({
    description: "Progress status",
    enum: ProgressStatus,
  })
  progressStatus?: ProgressStatus | null;

  @ApiPropertyOptional({ description: "Personal score", example: 9.2 })
  personalScore?: number | null;

  @ApiPropertyOptional({ description: "Date consumed" })
  consumedAt?: Date | null;

  @ApiProperty({ description: "Number of fetched episodes", example: 26 })
  fetchedEpisode: number;
}

export class PaginatedAnimeResponseDto {
  @ApiProperty({
    description: "List of anime",
    type: [AnimeListResponseDto],
  })
  data: AnimeListResponseDto[];

  @ApiProperty({ description: "Total number of items", example: 100 })
  total: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  page: number;

  @ApiProperty({ description: "Number of items per page", example: 10 })
  limit: number;

  @ApiProperty({ description: "Total number of pages", example: 10 })
  totalPages: number;
}
