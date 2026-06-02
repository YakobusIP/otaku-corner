import { ApiProperty } from "@nestjs/swagger";

export class DuplicateCheckResponseDto {
  @ApiProperty({
    description: "Whether a light novel with this ID exists"
  })
  exists: boolean;
}
