import { ApiProperty } from "@nestjs/swagger";

import { IsEnum, IsIn, IsInt, Min } from "class-validator";

export enum AssetInitReviewMediaType {
  ANIME = "ANIME",
  MANGA = "MANGA",
  LIGHT_NOVEL = "LIGHT_NOVEL"
}

export class ReviewAssetTargetDto {
  @ApiProperty({ enum: ["REVIEW"], example: "REVIEW" })
  @IsIn(["REVIEW"])
  kind: "REVIEW";

  @ApiProperty({
    enum: AssetInitReviewMediaType,
    example: AssetInitReviewMediaType.ANIME
  })
  @IsEnum(AssetInitReviewMediaType)
  mediaType: AssetInitReviewMediaType;

  @ApiProperty({
    description: "Primary key of AnimeReview / MangaReview / LightNovelReview",
    example: 1
  })
  @IsInt()
  @Min(1)
  id: number;
}
