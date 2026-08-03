import { ApiProperty } from "@nestjs/swagger";

export class ImageVaultR2AnalyticsResponseDto {
  @ApiProperty({
    description: "Total objects in the private R2 bucket"
  })
  objectCount!: number;

  @ApiProperty({
    description: "Class A operations over the last 30 days"
  })
  classAOperations!: number;

  @ApiProperty({
    description: "Class B operations over the last 30 days"
  })
  classBOperations!: number;

  @ApiProperty({
    description: "Total object payload size in bytes for the private R2 bucket"
  })
  totalPayloadSizeBytes!: number;
}
