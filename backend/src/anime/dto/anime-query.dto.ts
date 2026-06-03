import { ApiPropertyOptional } from "@nestjs/swagger";

import { PaginationQueryDto } from "@/common/dto";

import { ProgressStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString } from "class-validator";

const REVIEW_SORT_FIELDS = ["title", "score", "personal_score"] as const;
const SORT_ORDER_VALUES = ["asc", "desc"] as const;
const SCORE_RANGE_KEYS = ["poor", "average", "good", "excellent"] as const;
const STATUS_CHECK_VALUES = ["complete", "incomplete"] as const;

export class AnimeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Sort field",
    enum: REVIEW_SORT_FIELDS,
    example: "title"
  })
  @IsOptional()
  @IsString()
  @IsIn(REVIEW_SORT_FIELDS)
  sort?: string;

  @ApiPropertyOptional({
    description: "Sort order (asc/desc)",
    enum: SORT_ORDER_VALUES,
    example: "asc"
  })
  @IsOptional()
  @IsString()
  @IsIn(SORT_ORDER_VALUES)
  order?: string;

  @ApiPropertyOptional({ description: "Filter by genre ID", example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  genre?: number;

  @ApiPropertyOptional({ description: "Filter by studio ID", example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  studio?: number;

  @ApiPropertyOptional({ description: "Filter by theme ID", example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  theme?: number;

  @ApiPropertyOptional({
    description: "Filter by progress status",
    enum: ProgressStatus,
    example: ProgressStatus.COMPLETED
  })
  @IsOptional()
  @IsEnum(ProgressStatus)
  status?: ProgressStatus;

  @ApiPropertyOptional({
    description: "Filter by MAL score range (poor, average, good, excellent)",
    enum: SCORE_RANGE_KEYS,
    example: "good"
  })
  @IsOptional()
  @IsString()
  @IsIn(SCORE_RANGE_KEYS)
  malScore?: string;

  @ApiPropertyOptional({
    description:
      "Filter by personal score range (poor, average, good, excellent)",
    enum: SCORE_RANGE_KEYS,
    example: "excellent"
  })
  @IsOptional()
  @IsString()
  @IsIn(SCORE_RANGE_KEYS)
  personalScore?: string;

  @ApiPropertyOptional({
    description: "Filter by anime type",
    example: "TV"
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description:
      'Filter by completion status check ("complete" or "incomplete")',
    enum: STATUS_CHECK_VALUES,
    example: "complete"
  })
  @IsOptional()
  @IsString()
  @IsIn(STATUS_CHECK_VALUES)
  statusCheck?: string;
}
