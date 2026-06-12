import { ApiProperty } from "@nestjs/swagger";

import { ArrayMinSize, IsArray, IsInt } from "class-validator";

export class BulkDeleteDto {
  @ApiProperty({
    description: "Array of IDs to delete",
    example: [1, 2, 3],
    type: [Number]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];
}
