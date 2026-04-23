import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { Type } from "class-transformer";
import { IsIn, IsInt, IsString, Max, Min, ValidateIf } from "class-validator";

const ALLOWED_VIEWS = ["monthly", "yearly"] as const;
const ALLOWED_MEDIA = ["anime", "manga", "lightNovel"] as const;

export type StatisticsViewValue = (typeof ALLOWED_VIEWS)[number];
export type MediaValue = (typeof ALLOWED_MEDIA)[number];

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

export class MediaProgressQueryDto {
  @ApiProperty({
    enum: ALLOWED_MEDIA,
    description: "Media type to get progress statistics for"
  })
  @IsString()
  @IsIn(ALLOWED_MEDIA)
  media: MediaValue;
}
