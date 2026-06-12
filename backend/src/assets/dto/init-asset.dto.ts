import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { ImageVaultAssetTargetDto } from "@/assets/dto/image-vault-asset-target.dto";
import { ReviewAssetTargetDto } from "@/assets/dto/review-asset-target.dto";

import { AssetMediaType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested
} from "class-validator";

export type AssetInitTargetDto =
  | ReviewAssetTargetDto
  | ImageVaultAssetTargetDto;

export class InitAssetDto {
  @ApiProperty({
    description: "Attachment context for this asset (extensible by kind)",
    oneOf: [
      { $ref: "#/components/schemas/ReviewAssetTargetDto" },
      { $ref: "#/components/schemas/ImageVaultAssetTargetDto" }
    ]
  })
  @ValidateNested()
  @Type(() => Object, {
    discriminator: {
      property: "kind",
      subTypes: [
        { value: ReviewAssetTargetDto, name: "REVIEW" },
        { value: ImageVaultAssetTargetDto, name: "IMAGE_VAULT" }
      ]
    },
    keepDiscriminatorProperty: true
  })
  target: AssetInitTargetDto;

  @ApiProperty({
    description: "Declared MIME type for the upload",
    example: "image/png"
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  mimeType: string;

  @ApiProperty({
    description: "Declared byte length of the object to upload",
    example: 102400
  })
  @IsInt()
  @Min(1)
  expectedFileSize: number;

  @ApiPropertyOptional({
    description:
      "Object key directory prefix without leading or trailing slashes (e.g. review-images). Required for REVIEW targets; defaults to image-vault for IMAGE_VAULT targets.",
    example: "review-images"
  })
  @ValidateIf((dto: InitAssetDto) => dto.target.kind === "REVIEW")
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  storageDirectory?: string;

  @ApiPropertyOptional({
    description: "Logical asset kind (video disabled until supported)",
    enum: AssetMediaType,
    default: AssetMediaType.IMAGE
  })
  @IsOptional()
  @IsEnum(AssetMediaType)
  assetMediaType?: AssetMediaType;
}
