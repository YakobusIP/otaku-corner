import { IsOptional, IsString, IsInt, IsEnum, IsDate } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ProgressStatus } from "@prisma/client";

export class UpdateAnimeReviewDto {
  @ApiPropertyOptional({ description: "Review text" })
  @IsOptional()
  @IsString()
  reviewText?: string;

  @ApiPropertyOptional({ description: "Storyline rating (1-10)", example: 8 })
  @IsOptional()
  @IsInt()
  storylineRating?: number;

  @ApiPropertyOptional({ description: "Quality rating (1-10)", example: 9 })
  @IsOptional()
  @IsInt()
  qualityRating?: number;

  @ApiPropertyOptional({
    description: "Voice acting rating (1-10)",
    example: 8,
  })
  @IsOptional()
  @IsInt()
  voiceActingRating?: number;

  @ApiPropertyOptional({
    description: "Sound track rating (1-10)",
    example: 10,
  })
  @IsOptional()
  @IsInt()
  soundTrackRating?: number;

  @ApiPropertyOptional({
    description: "Character development rating (1-10)",
    example: 7,
  })
  @IsOptional()
  @IsInt()
  charDevelopmentRating?: number;

  @ApiPropertyOptional({
    description: "Progress status",
    enum: ProgressStatus,
    example: ProgressStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(ProgressStatus)
  progressStatus?: ProgressStatus;

  @ApiPropertyOptional({
    description: "Date consumed",
    example: "2024-06-15",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  consumedAt?: Date;
}
