import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GenreResponseDto {
  @ApiProperty({ description: "Genre ID", example: 1 })
  id: number;

  @ApiProperty({
    description: "Genre name",
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
      "Total media entries linked to this genre (anime + manga + light novel), when requested via connected_media"
  })
  connectedMediaCount?: number;
}
