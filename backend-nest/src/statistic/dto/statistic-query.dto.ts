import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

const ALLOWED_VIEWS = ["monthly", "yearly"] as const;
const ALLOWED_MEDIA = ["anime", "manga", "lightNovel"] as const;

export type StatisticsViewValue = (typeof ALLOWED_VIEWS)[number];
export type MediaValue = (typeof ALLOWED_MEDIA)[number];

export class MediaConsumptionQueryDto {
  @ApiProperty({
    enum: ALLOWED_VIEWS,
    description: "View type for media consumption statistics",
  })
  @IsString()
  @IsIn(ALLOWED_VIEWS)
  view: StatisticsViewValue;

  @ApiPropertyOptional({
    description: "Year filter (required for monthly view)",
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;
}

export class MediaProgressQueryDto {
  @ApiProperty({
    enum: ALLOWED_MEDIA,
    description: "Media type to get progress statistics for",
  })
  @IsString()
  @IsIn(ALLOWED_MEDIA)
  media: MediaValue;
}
