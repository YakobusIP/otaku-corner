import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class StudioResponseDto {
  @ApiProperty({ description: "Studio ID", example: 1 })
  id: number;

  @ApiProperty({
    description: "Studio name",
    example: "Action"
  })
  name: string;

  @ApiProperty({
    description: "Created at",
    example: "2024-01-01T00:00:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Updated at",
    example: "2024-01-01T00:00:00Z"
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description:
      "Total anime entries linked to this studio, when requested via connected_media"
  })
  connectedMediaCount?: number;
}
