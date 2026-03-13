import { ApiProperty } from "@nestjs/swagger";

import { IsNotEmpty, IsString } from "class-validator";

export class RefreshDto {
  @ApiProperty({
    description: "Refresh token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
