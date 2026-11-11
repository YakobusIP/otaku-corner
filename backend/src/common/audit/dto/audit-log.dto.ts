import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { AuditAction, AuditSource } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class AuditLogQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @ApiPropertyOptional({ description: "Opaque cursor from previous response" })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ enum: AuditSource })
  @IsOptional()
  @IsEnum(AuditSource)
  source?: AuditSource;
}

export class AuditLogItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ enum: AuditAction })
  action!: AuditAction;

  @ApiProperty({ enum: AuditSource })
  source!: AuditSource;

  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  entityId!: string;

  @ApiPropertyOptional({ nullable: true })
  actorUserId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  syncRunId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  before!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  after!: Record<string, unknown> | null;
}

export class AuditLogListResponseDto {
  @ApiProperty({ type: [AuditLogItemDto] })
  items!: AuditLogItemDto[];

  @ApiPropertyOptional({ nullable: true })
  nextCursor!: string | null;
}
