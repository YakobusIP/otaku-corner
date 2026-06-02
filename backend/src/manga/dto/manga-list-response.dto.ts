import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { ProgressStatus } from "@prisma/client";

export class MangaListResponseDto {
  @ApiProperty({ description: "Manga ID", example: 1 })
  id: number;

  @ApiProperty({ description: "URL slug", example: "berserk" })
  slug: string;

  @ApiProperty({ description: "Manga title", example: "Berserk" })
  title: string;

  @ApiProperty({
    description: "Japanese title",
    example: "ベルセルク"
  })
  titleJapanese: string;

  @ApiProperty({
    description: "Image URLs",
    example: { image_url: "https://example.com/image.jpg" }
  })
  images: object;

  @ApiProperty({ description: "Publishing status", example: "Finished" })
  status: string;

  @ApiProperty({ description: "MAL score", example: 9.47, nullable: true })
  score: number | null;

  @ApiPropertyOptional({ description: "Review text" })
  reviewText?: string | null;

  @ApiPropertyOptional({
    description: "Progress status",
    enum: ProgressStatus
  })
  progressStatus?: ProgressStatus | null;

  @ApiPropertyOptional({ description: "Personal score", example: 9.2 })
  personalScore?: number | null;

  @ApiPropertyOptional({ description: "Date consumed" })
  consumedAt?: Date | null;

  @ApiPropertyOptional({ description: "Number of chapters", example: 364 })
  chaptersCount?: number | null;

  @ApiPropertyOptional({ description: "Number of volumes", example: 41 })
  volumesCount?: number | null;
}

export class PaginatedMangaResponseDto {
  @ApiProperty({
    description: "List of manga",
    type: [MangaListResponseDto]
  })
  data: MangaListResponseDto[];

  @ApiProperty({ description: "Total number of items", example: 100 })
  total: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  page: number;

  @ApiProperty({ description: "Number of items per page", example: 10 })
  limit: number;

  @ApiProperty({ description: "Total number of pages", example: 10 })
  totalPages: number;
}
