import { ApiProperty } from "@nestjs/swagger";

import { MediaType } from "@/upload/enums/media-type.enum";

import { IsEnum, IsInt, IsNotEmpty } from "class-validator";

export class UploadImageDto {
  @ApiProperty({
    description: "Media type for the review",
    enum: MediaType,
    example: MediaType.ANIME
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({
    description: "ID of the review to attach the image to",
    example: 1
  })
  @IsInt()
  @IsNotEmpty()
  reviewId: number;
}
