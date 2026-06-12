import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { PaginatedResponseDto } from "@/common/dto";

import { ImageOriginTypeDto } from "@/image-vault/dto/image-vault-enums";

export class ImageVaultModelSummaryDto {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  isActive: boolean;
}

export class ImageVaultCategorySummaryDto {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

export class ImageVaultAssetSummaryDto {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty()
  mimeType: string;

  @ApiPropertyOptional()
  fileSize?: number | null;
}

export class ImageVaultSourceAssetDto extends ImageVaultAssetSummaryDto {
  @ApiProperty()
  previewUrl: string;
}

export class ImageLineageSummaryDto {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiPropertyOptional()
  prompt?: string | null;

  @ApiPropertyOptional()
  originalPrompt?: string | null;

  @ApiProperty()
  previewUrl: string;

  @ApiProperty()
  isExplicit: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class ImageEntryResponseDto {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty({ format: "uuid" })
  assetId: string;

  @ApiPropertyOptional({ format: "uuid" })
  parentId?: string | null;

  @ApiProperty({ enum: ImageOriginTypeDto })
  originType: ImageOriginTypeDto;

  @ApiPropertyOptional()
  sourceUrl?: string | null;

  @ApiPropertyOptional()
  prompt?: string | null;

  @ApiPropertyOptional()
  originalPrompt?: string | null;

  @ApiProperty()
  isExplicit: boolean;

  @ApiPropertyOptional()
  explicitReason?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  previewUrl: string;

  @ApiProperty({ type: ImageVaultAssetSummaryDto })
  asset: ImageVaultAssetSummaryDto;

  @ApiPropertyOptional({ type: ImageVaultModelSummaryDto })
  model?: ImageVaultModelSummaryDto | null;

  @ApiProperty({ type: [ImageVaultCategorySummaryDto] })
  categories: ImageVaultCategorySummaryDto[];

  @ApiPropertyOptional({ type: ImageVaultSourceAssetDto })
  sourceAsset?: ImageVaultSourceAssetDto | null;

  @ApiPropertyOptional({
    type: ImageVaultSourceAssetDto,
    description:
      "Resolved from the lineage root when this entry is a follow-up child"
  })
  rootSourceAsset?: ImageVaultSourceAssetDto | null;

  @ApiPropertyOptional({ type: ImageLineageSummaryDto })
  parent?: ImageLineageSummaryDto | null;

  @ApiPropertyOptional({ type: [ImageLineageSummaryDto] })
  children?: ImageLineageSummaryDto[];
}

export class PaginatedImageEntriesResponseDto extends PaginatedResponseDto<ImageEntryResponseDto> {
  @ApiProperty({ type: [ImageEntryResponseDto] })
  declare data: ImageEntryResponseDto[];
}
