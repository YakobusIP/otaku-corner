import { ApiPropertyOptional } from "@nestjs/swagger";

import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export const MAX_SITEMAP_LIMIT = 50000;

export class SitemapPaginationQueryDto {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: "Number of sitemap entries per page",
    example: 50000,
    minimum: 1,
    maximum: MAX_SITEMAP_LIMIT,
    default: 50000
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_SITEMAP_LIMIT)
  limit?: number;
}
