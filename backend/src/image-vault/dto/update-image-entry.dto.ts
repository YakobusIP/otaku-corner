import { ApiPropertyOptional } from "@nestjs/swagger";

import {
  ImageOriginTypeDto,
  ImageVaultSafetyLevelDto
} from "@/image-vault/dto/image-vault-enums";
import { IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY } from "@/image-vault/image-vault.constants";

import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength
} from "class-validator";

export class UpdateImageEntryDto {
  @ApiPropertyOptional({ enum: ImageOriginTypeDto })
  @IsOptional()
  @IsEnum(ImageOriginTypeDto)
  originType?: ImageOriginTypeDto;

  @ApiPropertyOptional({
    format: "uuid",
    description:
      "Reference/source image for root entries only; pass null to remove"
  })
  @IsOptional()
  @IsUUID()
  sourceAssetId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  sourceUrl?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  modelId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  prompt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  originalPrompt?: string | null;

  @ApiPropertyOptional({ enum: ImageVaultSafetyLevelDto })
  @IsOptional()
  @IsEnum(ImageVaultSafetyLevelDto)
  safetyLevel?: ImageVaultSafetyLevelDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  safetyReason?: string | null;

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
  notes?: string | null;
}
