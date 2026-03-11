import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateStudioDto {
  @ApiProperty({
    description: "Studio name (case-insensitive unique).",
    example: "Action",
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;
}
