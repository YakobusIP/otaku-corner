import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AppSettingResponseDto {
  @ApiProperty({
    example: "review.personal_score_weights.anime"
  })
  key!: string;

  @ApiProperty({
    example: {
      storylineRating: 0.3,
      qualityRating: 0.25
    }
  })
  value!: unknown;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({
    description:
      "Number of reviews queued for personal-score recalculation after a score-weights save",
    example: 42
  })
  recalculationQueuedCount?: number;
}
