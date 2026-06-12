import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { ImageOriginTypeDto } from "@/image-vault/dto/image-vault-enums";
import { IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY } from "@/image-vault/image-vault.constants";

import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  ValidateIf
} from "class-validator";

export class CreateImageEntryDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  assetId: string;

  @ApiPropertyOptional({
    format: "uuid",
    description:
      "Optional reference/source image for root entries only; must be a completed private vault upload"
  })
  @IsOptional()
  @IsUUID()
  sourceAssetId?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Parent entry when creating a follow-up image"
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ enum: ImageOriginTypeDto })
  @IsEnum(ImageOriginTypeDto)
  originType: ImageOriginTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  sourceUrl?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @ValidateIf(
    (o: CreateImageEntryDto) => o.originType === ImageOriginTypeDto.AI
  )
  @IsUUID()
  modelId?: string;

  @ApiPropertyOptional()
  @ValidateIf(
    (o: CreateImageEntryDto) => o.originType === ImageOriginTypeDto.AI
  )
  @IsString()
  @MaxLength(10000)
  prompt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  originalPrompt?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isExplicit?: boolean;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateImageEntryDto) => o.isExplicit === true)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  explicitReason?: string;

  @ApiPropertyOptional({ type: [String], format: "uuid" })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  @ArrayMaxSize(IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY)
  categoryIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
