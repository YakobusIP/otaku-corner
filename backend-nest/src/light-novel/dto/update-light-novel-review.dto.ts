import { IsOptional, IsString, IsInt, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { ProgressStatus } from "@prisma/client";

export class UpdateLightNovelReviewDto {
  @ApiPropertyOptional({ description: "Review text" })
  @IsOptional()
  @IsString()
  reviewText?: string;

  @ApiPropertyOptional({ description: "Storyline rating (1-10)", example: 8 })
  @IsOptional()
  @IsInt()
  storylineRating?: number;

  @ApiPropertyOptional({
    description: "World building rating (1-10)",
    example: 9,
  })
  @IsOptional()
  @IsInt()
  worldBuildingRating?: number;

  @ApiPropertyOptional({
    description: "Writing style rating (1-10)",
    example: 8,
  })
  @IsOptional()
  @IsInt()
  writingStyleRating?: number;

  @ApiPropertyOptional({
    description: "Character development rating (1-10)",
    example: 7,
  })
  @IsOptional()
  @IsInt()
  charDevelopmentRating?: number;

  @ApiPropertyOptional({
    description: "Originality rating (1-10)",
    example: 8,
  })
  @IsOptional()
  @IsInt()
  originalityRating?: number;

  @ApiPropertyOptional({
    description: "Progress status",
    enum: ProgressStatus,
    example: ProgressStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(ProgressStatus)
  progressStatus?: ProgressStatus;
}
