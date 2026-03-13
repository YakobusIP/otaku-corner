import { ApiPropertyOptional } from "@nestjs/swagger";

import { PaginationQueryDto } from "@/common/dto";

import { ProgressStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class LightNovelQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Sort field", example: "title" })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: "Sort order (asc/desc)", example: "asc" })
  @IsOptional()
  @IsString()
  order?: string;

  @ApiPropertyOptional({ description: "Filter by author ID", example: 1 })
  @IsOptional()
  @Type(() => Number)
  author?: number;

  @ApiPropertyOptional({ description: "Filter by genre ID", example: 1 })
  @IsOptional()
  @Type(() => Number)
  genre?: number;

  @ApiPropertyOptional({ description: "Filter by theme ID", example: 1 })
  @IsOptional()
  @Type(() => Number)
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
    example: "good"
  })
  @IsOptional()
  @IsString()
  malScore?: string;

  @ApiPropertyOptional({
    description:
      "Filter by personal score range (poor, average, good, excellent)",
    example: "excellent"
  })
  @IsOptional()
  @IsString()
  personalScore?: string;

  @ApiPropertyOptional({
    description:
      'Filter by completion status check ("complete" or "incomplete")',
    example: "complete"
  })
  @IsOptional()
  @IsString()
  statusCheck?: string;
}
