import { ApiPropertyOptional } from "@nestjs/swagger";

import { ProgressStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateMangaReviewDto {
  @ApiPropertyOptional({ description: "Review text" })
  @IsOptional()
  @IsString()
  reviewText?: string;

  @ApiPropertyOptional({ description: "Storyline rating (1-10)", example: 8 })
  @IsOptional()
  @IsInt()
  storylineRating?: number;

  @ApiPropertyOptional({ description: "Art style rating (1-10)", example: 9 })
  @IsOptional()
  @IsInt()
  artStyleRating?: number;

  @ApiPropertyOptional({
    description: "Character development rating (1-10)",
    example: 7
  })
  @IsOptional()
  @IsInt()
  charDevelopmentRating?: number;

  @ApiPropertyOptional({
    description: "World building rating (1-10)",
    example: 8
  })
  @IsOptional()
  @IsInt()
  worldBuildingRating?: number;

  @ApiPropertyOptional({
    description: "Originality rating (1-10)",
    example: 9
  })
  @IsOptional()
  @IsInt()
  originalityRating?: number;

  @ApiPropertyOptional({
    description: "Progress status",
    enum: ProgressStatus,
    example: ProgressStatus.COMPLETED
  })
  @IsOptional()
  @IsEnum(ProgressStatus)
  progressStatus?: ProgressStatus;

  @ApiPropertyOptional({
    description: "Date consumed",
    example: "2024-06-15"
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  consumedAt?: Date;
}
