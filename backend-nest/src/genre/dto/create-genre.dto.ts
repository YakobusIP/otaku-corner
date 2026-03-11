import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateGenreDto {
  @ApiProperty({
    description: "Genre name (case-insensitive unique).",
    example: "Action",
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;
}
