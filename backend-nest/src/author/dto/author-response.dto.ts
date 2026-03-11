import { ApiProperty } from "@nestjs/swagger";

export class AuthorResponseDto {
  @ApiProperty({ description: "Author ID", example: 1 })
  id: number;

  @ApiProperty({
    description: "Author name",
    example: "Action",
  })
  name: string;

  @ApiProperty({
    description: "Created at",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Updated at",
    example: "2024-01-01T00:00:00Z",
  })
  updatedAt: Date;
}
