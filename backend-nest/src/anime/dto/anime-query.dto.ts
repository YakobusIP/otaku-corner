import { IsOptional, IsString, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ProgressStatus } from "@prisma/client";
import { PaginationQueryDto } from "@/common/dto";

export class AnimeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Sort field", example: "title" })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: "Sort order (asc/desc)", example: "asc" })
  @IsOptional()
  @IsString()
  order?: string;

  @ApiPropertyOptional({ description: "Filter by genre ID", example: 1 })
  @IsOptional()
  @Type(() => Number)
  genre?: number;

  @ApiPropertyOptional({ description: "Filter by studio ID", example: 1 })
  @IsOptional()
  @Type(() => Number)
  studio?: number;

  @ApiPropertyOptional({ description: "Filter by theme ID", example: 1 })
  @IsOptional()
  @Type(() => Number)
  theme?: number;

  @ApiPropertyOptional({
    description: "Filter by progress status",
    enum: ProgressStatus,
    example: ProgressStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(ProgressStatus)
  status?: ProgressStatus;

  @ApiPropertyOptional({
    description: "Filter by MAL score range (poor, average, good, excellent)",
    example: "good",
  })
  @IsOptional()
  @IsString()
  malScore?: string;

  @ApiPropertyOptional({
    description:
      "Filter by personal score range (poor, average, good, excellent)",
    example: "excellent",
  })
  @IsOptional()
  @IsString()
  personalScore?: string;

  @ApiPropertyOptional({
    description: "Filter by anime type",
    example: "TV",
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description:
      'Filter by completion status check ("complete" or "incomplete")',
    example: "complete",
  })
  @IsOptional()
  @IsString()
  statusCheck?: string;
}
