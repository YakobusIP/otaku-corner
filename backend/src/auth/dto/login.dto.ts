import { ApiProperty } from "@nestjs/swagger";

import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "PIN 1",
    example: "123456"
  })
  @IsString()
  @IsNotEmpty()
  pin1: string;

  @ApiProperty({
    description: "PIN 2",
    example: "123456"
  })
  @IsString()
  @IsNotEmpty()
  pin2: string;
}
