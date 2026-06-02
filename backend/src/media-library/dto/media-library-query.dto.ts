import { ApiPropertyOptional } from "@nestjs/swagger";

import { ProgressStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

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
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: "Case-insensitive search on title and synonyms"
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: "Sort field: title, score, personal_score"
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: "Sort order (asc or desc)" })
  @IsOptional()
  @IsString()
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

  @ApiPropertyOptional({ description: "Filter by MAL score range" })
  @IsOptional()
  @IsString()
  malScore?: string;

  @ApiPropertyOptional({ description: "Filter by personal score range" })
  @IsOptional()
  @IsString()
  personalScore?: string;

  @ApiPropertyOptional({
    description:
      "Filter by anime type (TV, Movie, …); anime rows only; ignored for manga / LN"
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: "Filter by completion status (complete or incomplete)"
  })
  @IsOptional()
  @IsString()
  statusCheck?: string;
}
