import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { PaginatedResponseDto } from "@/common/dto";

import { ProgressStatus } from "@prisma/client";

export class VolumeProgressItemDto {
  @ApiProperty({ description: "Volume number", example: 1 })
  volumeNumber: number;

  @ApiPropertyOptional({
    description: "Date consumed",
    example: "2024-06-15",
    nullable: true
  })
  consumedAt: Date | null;
}

export class LightNovelListResponseDto {
  @ApiProperty({ description: "Light novel ID", example: 1 })
  id: number;

  @ApiProperty({ description: "URL slug", example: "sword-art-online" })
  slug: string;

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

  @ApiProperty({
    description: "Image URLs",
    example: { image_url: "https://example.com/image.jpg" }
  })
  images: object;

  @ApiProperty({ description: "Publishing status", example: "Finished" })
  status: string;

  @ApiProperty({ description: "MAL score", example: 7.55, nullable: true })
  score: number | null;

  @ApiPropertyOptional({ description: "Review text" })
  reviewText?: string | null;

  @ApiPropertyOptional({
    description: "Progress status",
    enum: ProgressStatus
  })
  progressStatus?: ProgressStatus | null;

  @ApiPropertyOptional({ description: "Personal score", example: 8.5 })
  personalScore?: number | null;

  @ApiProperty({
    description: "Volume progress entries",
    type: [VolumeProgressItemDto]
  })
  volumeProgress: VolumeProgressItemDto[];

  @ApiPropertyOptional({
    description: "Number of volumes",
    example: 27,
    nullable: true
  })
  volumesCount?: number | null;
}

export class PaginatedLightNovelResponseDto extends PaginatedResponseDto<LightNovelListResponseDto> {
  @ApiProperty({
    description: "List of light novels",
    type: [LightNovelListResponseDto]
  })
  declare data: LightNovelListResponseDto[];
}
