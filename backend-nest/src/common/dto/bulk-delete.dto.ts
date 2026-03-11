import { IsArray, IsInt, ArrayMinSize } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BulkDeleteDto {
  @ApiProperty({
    description: "Array of IDs to delete",
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];
}
