import { ApiPropertyOptional } from "@nestjs/swagger";

import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";
import { parseOptionalQueryBoolean } from "@/common/utils/parse-optional-query-boolean";

import { ImageOriginTypeDto } from "@/image-vault/dto/image-vault-enums";

import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID
} from "class-validator";

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

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalQueryBoolean(value))
  @IsBoolean()
  isExplicit?: boolean;

  @ApiPropertyOptional({
    description: "Search prompt, source URL, or notes"
  })
  @IsOptional()
  @IsString()
  search?: string;
}
