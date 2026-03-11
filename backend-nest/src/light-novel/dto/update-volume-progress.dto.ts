import {
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsDate,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class UpdateVolumeProgressItemDto {
  @ApiProperty({ description: "Volume progress record ID", example: 1 })
  @IsInt()
  id: number;

  @ApiPropertyOptional({
    description: "Date consumed",
    example: "2024-06-15",
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  consumedAt?: Date | null;
}

export class UpdateVolumeProgressDto {
  @ApiProperty({
    description: "Array of volume progress updates",
    type: [UpdateVolumeProgressItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateVolumeProgressItemDto)
  data: UpdateVolumeProgressItemDto[];
}
