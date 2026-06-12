import { ApiPropertyOptional } from "@nestjs/swagger";

import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateImageCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug?: string;
}
