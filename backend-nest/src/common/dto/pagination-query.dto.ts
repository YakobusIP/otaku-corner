import { BadRequestException } from "@nestjs/common";
import { ApiPropertyOptional } from "@nestjs/swagger";

import { Transform, Type } from "class-transformer";
import { IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";

export class PaginationQueryDto {
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
    description: "Number of items per page",
    example: 10,
    minimum: 1,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: "Search query (case-insensitive search by name)",
    example: "john"
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description:
      "IDs to always return first on page 1 (in listed order), before the rest of the page. One query parameter: comma-separated IDs (e.g. include_ids=3,7,12).",
    example: "3,7,12"
  })
  @IsOptional()
  @Transform(({ value }): number[] | undefined => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    if (typeof value !== "string") {
      throw new BadRequestException(
        "include_ids must be a comma-separated string in a single query parameter (e.g. include_ids=3,7,12)"
      );
    }
    const numbers = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isInteger(n) && n >= 1);
    if (numbers.length === 0) {
      return undefined;
    }
    const seen = new Set<number>();
    const unique: number[] = [];
    for (const n of numbers) {
      if (seen.has(n)) {
        continue;
      }
      seen.add(n);
      unique.push(n);
    }
    return unique;
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  include_ids?: number[];
}
