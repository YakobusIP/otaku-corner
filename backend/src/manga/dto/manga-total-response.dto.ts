import { ApiProperty } from "@nestjs/swagger";

export class MangaTotalResponseDto {
  @ApiProperty({ description: "Total number of manga records", example: 42 })
  count: number;
}
