import { ApiProperty } from "@nestjs/swagger";

export class AnimeTotalResponseDto {
  @ApiProperty({ description: "Total number of anime records", example: 42 })
  count: number;
}
