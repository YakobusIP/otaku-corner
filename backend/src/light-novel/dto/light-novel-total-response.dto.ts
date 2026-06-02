import { ApiProperty } from "@nestjs/swagger";

export class LightNovelTotalResponseDto {
  @ApiProperty({
    description: "Total number of light novel records",
    example: 42
  })
  count: number;
}
