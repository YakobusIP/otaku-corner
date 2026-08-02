import { ApiProperty } from "@nestjs/swagger";

import { IsDefined, IsObject } from "class-validator";

export class UpsertAppSettingDto {
  @ApiProperty({
    description: "JSON value stored for the setting key",
    example: {
      storylineRating: 0.3,
      qualityRating: 0.25,
      voiceActingRating: 0.2,
      soundTrackRating: 0.15,
      charDevelopmentRating: 0.1
    }
  })
  @IsDefined()
  @IsObject()
  value!: Record<string, unknown>;
}
