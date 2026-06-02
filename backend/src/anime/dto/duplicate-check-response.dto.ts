import { ApiProperty } from "@nestjs/swagger";

export class DuplicateCheckResponseDto {
  @ApiProperty({ description: "Whether an anime with this ID exists" })
  exists: boolean;
}
