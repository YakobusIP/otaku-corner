import { ApiProperty } from "@nestjs/swagger";

import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateImageCategoryDto {
  @ApiProperty({ example: "Character Art" })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: "character-art" })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug: string;
}
