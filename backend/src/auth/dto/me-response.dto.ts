import { ApiProperty } from "@nestjs/swagger";

export class MeResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "2026-03-09T12:34:56.789Z" })
  createdAt!: string;
}
