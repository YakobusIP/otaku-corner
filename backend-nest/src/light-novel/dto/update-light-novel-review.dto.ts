import { ApiPropertyOptional } from "@nestjs/swagger";

import { ProgressStatus } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateLightNovelReviewDto {
  @ApiPropertyOptional({ description: "Review text" })
  @IsOptional()
  @IsString()
  reviewText?: string;

  @ApiPropertyOptional({ description: "Storyline rating (1-10)", example: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  storylineRating?: number;

  @ApiPropertyOptional({
    description: "World building rating (1-10)",
    example: 9
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  worldBuildingRating?: number;

  @ApiPropertyOptional({
    description: "Writing style rating (1-10)",
    example: 8
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  writingStyleRating?: number;

  @ApiPropertyOptional({
    description: "Character development rating (1-10)",
    example: 7
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  charDevelopmentRating?: number;

  @ApiPropertyOptional({
    description: "Originality rating (1-10)",
    example: 8
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  originalityRating?: number;

  @ApiPropertyOptional({
    description: "Progress status",
    enum: ProgressStatus,
    example: ProgressStatus.COMPLETED
  })
  @IsOptional()
  @IsEnum(ProgressStatus)
  progressStatus?: ProgressStatus;
}
