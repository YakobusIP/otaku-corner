import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

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
  ValidateNested
} from "class-validator";

export class InitAssetDto {
  @ApiProperty({
    type: ReviewAssetTargetDto,
    description: "Attachment context for this asset (extensible by kind)"
  })
  @ValidateNested()
  @Type(() => ReviewAssetTargetDto)
  target: ReviewAssetTargetDto;

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

  @ApiProperty({
    description:
      "Object key directory prefix without leading or trailing slashes (e.g. review-images). Combined with the generated filename to form the full storage key.",
    example: "review-images"
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  storageDirectory: string;

  @ApiPropertyOptional({
    description: "Logical asset kind (video disabled until supported)",
    enum: AssetMediaType,
    default: AssetMediaType.IMAGE
  })
  @IsOptional()
  @IsEnum(AssetMediaType)
  assetMediaType?: AssetMediaType;
}
