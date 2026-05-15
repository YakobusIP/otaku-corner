import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class InitAssetResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  assetId: string;

  @ApiProperty({
    description: "Presigned URL for HTTP PUT of the raw bytes",
    example: "https://…"
  })
  uploadUrl: string;

  @ApiProperty({ example: "PUT" })
  method: "PUT";

  @ApiPropertyOptional({
    description: "Headers the client must send with the PUT",
    example: { "Content-Type": "image/png" }
  })
  headers?: Record<string, string>;
}
