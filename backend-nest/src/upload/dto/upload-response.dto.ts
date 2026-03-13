import { ApiProperty } from "@nestjs/swagger";

export class UploadResponseDto {
  @ApiProperty({
    description: "ID of the uploaded image",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "URL of the uploaded image",
    example:
      "http://localhost:3000/uploads/550e8400-e29b-41d4-a716-446655440000.png"
  })
  url: string;
}
