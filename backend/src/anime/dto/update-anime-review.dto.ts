import { ApiPropertyOptional } from "@nestjs/swagger";

import { ProgressStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min
} from "class-validator";

export class UpdateAnimeReviewDto {
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

  @ApiPropertyOptional({ description: "Quality rating (1-10)", example: 9 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  qualityRating?: number;

  @ApiPropertyOptional({
    description: "Voice acting rating (1-10)",
    example: 8
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  voiceActingRating?: number;

  @ApiPropertyOptional({
    description: "Sound track rating (1-10)",
    example: 10
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  soundTrackRating?: number;

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
