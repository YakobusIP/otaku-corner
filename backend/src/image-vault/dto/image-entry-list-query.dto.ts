import { ApiPropertyOptional } from "@nestjs/swagger";

import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";

import {
  ImageOriginTypeDto,
  ImageVaultSafetyLevelDto
} from "@/image-vault/dto/image-vault-enums";

import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export const IMAGE_VAULT_DEFAULT_PAGE_LIMIT = 10;

export class ImageEntryListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ImageOriginTypeDto })
  @IsOptional()
  @IsEnum(ImageOriginTypeDto)
  originType?: ImageOriginTypeDto;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  modelId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ImageVaultSafetyLevelDto })
  @IsOptional()
  @IsEnum(ImageVaultSafetyLevelDto)
  safetyLevel?: ImageVaultSafetyLevelDto;

  @ApiPropertyOptional({
    description: "Search prompt, source URL, or notes"
  })
  @IsOptional()
  @IsString()
  search?: string;
}
