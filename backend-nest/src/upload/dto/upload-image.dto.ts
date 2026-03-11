import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsInt } from "class-validator";

export class UploadImageDto {
  @ApiProperty({
    description: "Media type for the review",
    enum: ["Anime", "Manga", "Light Novel"],
    example: "Anime",
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: "ID of the review to attach the image to",
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  reviewId: number;
}
