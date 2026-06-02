import { ApiProperty } from "@nestjs/swagger";

export class DuplicateCheckResponseDto {
  @ApiProperty({ description: "Whether a manga with this ID exists" })
  exists: boolean;
}
