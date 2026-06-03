import { ApiPropertyOptional } from "@nestjs/swagger";

import { MAX_PAGE_LIMIT } from "@/common/dto/pagination-query.dto";

import { ProgressStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min
} from "class-validator";

const MEDIA_LIBRARY_SORT_FIELDS = ["title", "score", "personal_score"] as const;
const SORT_ORDER_VALUES = ["asc", "desc"] as const;
const SCORE_RANGE_KEYS = ["poor", "average", "good", "excellent"] as const;
const STATUS_CHECK_VALUES = ["complete", "incomplete"] as const;

export class MediaLibraryQueryDto {
  @ApiPropertyOptional({ description: "Page number", example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: "Items per page (global across all media types)",
    example: 10,
    minimum: 1,
    maximum: MAX_PAGE_LIMIT
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_LIMIT)
  limit?: number;

  @ApiPropertyOptional({
    description: "Case-insensitive search on title and synonyms"
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: "Sort field: title, score, personal_score",
    enum: MEDIA_LIBRARY_SORT_FIELDS
  })
  @IsOptional()
  @IsString()
  @IsIn(MEDIA_LIBRARY_SORT_FIELDS)
  sort?: string;

  @ApiPropertyOptional({
    description: "Sort order (asc or desc)",
    enum: SORT_ORDER_VALUES
  })
  @IsOptional()
  @IsString()
  @IsIn(SORT_ORDER_VALUES)
  order?: string;

  @ApiPropertyOptional({ description: "Filter by genre ID" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  genre?: number;

  @ApiPropertyOptional({
    description: "Filter by studio ID (anime only; ignored for manga / LN)"
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  studio?: number;

  @ApiPropertyOptional({ description: "Filter by theme ID" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  theme?: number;

  @ApiPropertyOptional({
    description:
      "Filter by author ID (manga / light novel only; excludes anime when set)"
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  author?: number;

  @ApiPropertyOptional({
    description: "Filter by progress status (review)",
    enum: ProgressStatus
  })
  @IsOptional()
  @IsEnum(ProgressStatus)
  status?: ProgressStatus;

  @ApiPropertyOptional({
    description: "Filter by MAL score range",
    enum: SCORE_RANGE_KEYS
  })
  @IsOptional()
  @IsString()
  @IsIn(SCORE_RANGE_KEYS)
  malScore?: string;

  @ApiPropertyOptional({
    description: "Filter by personal score range",
    enum: SCORE_RANGE_KEYS
  })
  @IsOptional()
  @IsString()
  @IsIn(SCORE_RANGE_KEYS)
  personalScore?: string;

  @ApiPropertyOptional({
    description:
      "Filter by anime type (TV, Movie, …); anime rows only; ignored for manga / LN"
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: "Filter by completion status (complete or incomplete)",
    enum: STATUS_CHECK_VALUES
  })
  @IsOptional()
  @IsString()
  @IsIn(STATUS_CHECK_VALUES)
  statusCheck?: string;
}
