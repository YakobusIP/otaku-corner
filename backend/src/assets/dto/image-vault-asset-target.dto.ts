import { ApiProperty } from "@nestjs/swagger";

import { IsIn } from "class-validator";

export class ImageVaultAssetTargetDto {
  @ApiProperty({ enum: ["IMAGE_VAULT"], example: "IMAGE_VAULT" })
  @IsIn(["IMAGE_VAULT"])
  kind: "IMAGE_VAULT";
}
