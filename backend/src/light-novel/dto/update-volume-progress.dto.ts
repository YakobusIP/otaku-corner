import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  ValidateNested
} from "class-validator";

export class UpdateVolumeProgressItemDto {
  @ApiProperty({ description: "Volume progress record ID", example: 1 })
  @IsInt()
  id: number;

  @ApiPropertyOptional({
    description: "Date consumed",
    example: "2024-06-15",
    nullable: true
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  consumedAt?: Date | null;
}

export class UpdateVolumeProgressDto {
  @ApiProperty({
    description: "Array of volume progress updates",
    type: [UpdateVolumeProgressItemDto]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateVolumeProgressItemDto)
  data: UpdateVolumeProgressItemDto[];
}
