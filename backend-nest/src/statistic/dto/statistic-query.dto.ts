import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf
} from "class-validator";

const ALLOWED_VIEWS = ["monthly", "yearly"] as const;

export type StatisticsViewValue = (typeof ALLOWED_VIEWS)[number];

export class MediaConsumptionQueryDto {
  @ApiProperty({
    enum: ALLOWED_VIEWS,
    description: "View type for media consumption statistics"
  })
  @IsString()
  @IsIn(ALLOWED_VIEWS)
  view: StatisticsViewValue;

  @ApiPropertyOptional({
    description: "Calendar year (required when view is monthly)"
  })
  @ValidateIf((o: MediaConsumptionQueryDto) => o.view === "monthly")
  @IsInt()
  @Min(1970)
  @Max(2100)
  @Type(() => Number)
  year?: number;
}

export class DashboardYearQueryDto {
  @ApiPropertyOptional({
    description:
      "Calendar year for dashboard KPIs and year-scoped sections (omit when allTime is true)",
    minimum: 1970,
    maximum: 2100
  })
  @ValidateIf((o: DashboardYearQueryDto) => !o.allTime)
  @IsInt()
  @Min(1970)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({
    description:
      "When true, returns current snapshot with no year-over-year comparison"
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  allTime?: boolean;
}

export class RecentReviewsQueryDto {
  @ApiPropertyOptional({
    description: "Maximum number of recent reviews to return",
    minimum: 1,
    maximum: 50,
    default: 10
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;
}

export class TasteProfileQueryDto {
  @ApiPropertyOptional({
    description: "Rows per taste tab (genres, themes, studios, authors)",
    minimum: 1,
    maximum: 30,
    default: 10
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  @Type(() => Number)
  limit?: number;
}
