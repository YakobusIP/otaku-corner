import { ApiProperty } from "@nestjs/swagger";

import { ArrayMinSize, IsArray, IsUUID } from "class-validator";

export class BulkDeleteUuidDto {
  @ApiProperty({
    description: "Array of UUIDs to delete",
    example: [
      "550e8400-e29b-41d4-a716-446655440000",
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
    ],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  ids: string[];
}
