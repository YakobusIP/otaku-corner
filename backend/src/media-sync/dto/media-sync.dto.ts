import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import {
  MediaSyncItemOutcome,
  MediaSyncMediaType,
  MediaSyncRunStatus,
  MediaSyncRunType
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested
} from "class-validator";

export class MediaSyncRunQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class MediaSyncItemQueryDto extends MediaSyncRunQueryDto {
  @ApiPropertyOptional({ enum: MediaSyncItemOutcome })
  @IsOptional()
  @IsEnum(MediaSyncItemOutcome)
  outcome?: MediaSyncItemOutcome;
}

export class MediaSyncRunListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: MediaSyncRunType })
  type!: MediaSyncRunType;

  @ApiProperty({ enum: MediaSyncRunStatus })
  status!: MediaSyncRunStatus;

  @ApiPropertyOptional({ nullable: true })
  startedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  finishedAt!: Date | null;

  @ApiProperty()
  touchedCount!: number;

  @ApiProperty()
  updatedCount!: number;

  @ApiProperty()
  unchangedCount!: number;

  @ApiProperty()
  conflictedCount!: number;

  @ApiProperty()
  failedCount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class PaginatedMediaSyncRunResponseDto {
  @ApiProperty({ type: [MediaSyncRunListItemDto] })
  data!: MediaSyncRunListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class MediaSyncConflictDto {
  @ApiProperty()
  field!: string;

  @ApiPropertyOptional({ nullable: true })
  base!: unknown;

  @ApiPropertyOptional({ nullable: true })
  local!: unknown;

  @ApiPropertyOptional({ nullable: true })
  upstream!: unknown;

  @ApiProperty({
    enum: [
      "null_clear",
      "count_zero_regression",
      "large_decrease",
      "identity_drift",
      "divergent_change"
    ]
  })
  rule!: string;
}

export class MediaSyncFieldResolutionDto {
  @ApiProperty()
  @IsString()
  field!: string;

  @ApiProperty({ enum: ["accept_upstream", "keep_local"] })
  @IsIn(["accept_upstream", "keep_local"])
  choice!: "accept_upstream" | "keep_local";
}

export class MediaSyncConflictActionDto {
  @ApiProperty({
    description:
      "Client-visible conflict item version; must match the current open item"
  })
  @IsInt()
  @Min(1)
  expectedVersion!: number;
}

export class ResolveMediaSyncFieldsDto extends MediaSyncConflictActionDto {
  @ApiProperty({ type: [MediaSyncFieldResolutionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MediaSyncFieldResolutionDto)
  resolutions!: MediaSyncFieldResolutionDto[];
}

export class MediaSyncItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: MediaSyncMediaType })
  mediaType!: MediaSyncMediaType;

  @ApiProperty()
  mediaId!: number;

  @ApiPropertyOptional({ nullable: true })
  mediaTitle!: string | null;

  @ApiProperty({ enum: MediaSyncItemOutcome })
  outcome!: MediaSyncItemOutcome;

  @ApiPropertyOptional({ nullable: true })
  errorMessage!: string | null;

  @ApiPropertyOptional({ type: [MediaSyncConflictDto], nullable: true })
  conflicts!: MediaSyncConflictDto[] | null;

  @ApiPropertyOptional({
    nullable: true,
    description: "Pending catalog field map available when outcome is CONFLICT"
  })
  pendingUpstream!: Record<string, unknown> | null;

  @ApiPropertyOptional({
    nullable: true,
    description: "Baseline catalog snapshot at conflict time"
  })
  baselineCatalog!: Record<string, unknown> | null;

  @ApiPropertyOptional({
    nullable: true,
    description: "Accumulated per-field resolution choices for traceability"
  })
  fieldResolutions!: Record<string, "accept_upstream" | "keep_local"> | null;

  @ApiProperty({
    description: "Optimistic-lock version for open conflict resolution"
  })
  version!: number;

  @ApiPropertyOptional({ nullable: true })
  resolvedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  resolvedByUserId!: number | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional({
    description: "Originating sync run id (open-conflict inbox)"
  })
  syncRunId?: string;

  @ApiPropertyOptional({
    description:
      "True when this open conflict predates trusted three-way baseline snapshots"
  })
  isLegacyUntrusted?: boolean;
}

export class PaginatedOpenMediaSyncConflictsDto {
  @ApiProperty({ type: [MediaSyncItemDto] })
  data!: MediaSyncItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class MediaSyncRunDetailDto extends MediaSyncRunListItemDto {
  @ApiPropertyOptional({ nullable: true })
  errorMessage!: string | null;

  @ApiProperty({ type: [MediaSyncItemDto] })
  items!: MediaSyncItemDto[];

  @ApiProperty()
  itemsTotal!: number;

  @ApiProperty()
  itemsPage!: number;

  @ApiProperty()
  itemsLimit!: number;

  @ApiProperty()
  itemsTotalPages!: number;

  @ApiProperty({
    type: [MediaSyncItemDto],
    description:
      "Open conflicts for media touched in this run but owned by another run. Resolve these from the global Open Conflicts inbox."
  })
  relatedOpenConflicts!: MediaSyncItemDto[];

  @ApiProperty({
    description: "Distinct media rows touched in this run"
  })
  touchedMediaCount!: number;
}
