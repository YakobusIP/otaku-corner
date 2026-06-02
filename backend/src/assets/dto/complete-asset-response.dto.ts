import { ApiProperty } from "@nestjs/swagger";

import { AssetStatus } from "@prisma/client";

export class CompleteAssetResponseDto {
  @ApiProperty()
  assetId: string;

  @ApiProperty({ enum: AssetStatus })
  status: AssetStatus;

  @ApiProperty()
  url: string;
}
