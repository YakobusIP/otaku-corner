import { ApiProperty } from "@nestjs/swagger";

import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateThemeDto {
  @ApiProperty({
    description: "Theme name (case-insensitive unique).",
    example: "Action",
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;
}
