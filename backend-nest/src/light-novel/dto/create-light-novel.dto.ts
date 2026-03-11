import {
  IsInt,
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateLightNovelItemDto {
  @ApiProperty({ description: "MAL ID", example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ description: "URL slug", example: "sword-art-online" })
  @IsString()
  slug: string;

  @ApiProperty({
    description: "Publishing status",
    example: "Finished",
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: "Light novel title",
    example: "Sword Art Online",
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: "Japanese title",
    example: "ソードアート・オンライン",
  })
  @IsString()
  titleJapanese: string;

  @ApiProperty({
    description: "Title synonyms (comma-separated)",
    example: "SAO",
  })
  @IsString()
  titleSynonyms: string;

  @ApiProperty({
    description: "Published date range",
    example: "Apr 10, 2009 to ?",
  })
  @IsString()
  published: string;

  @ApiPropertyOptional({ description: "Number of volumes", example: 27 })
  @IsOptional()
  @IsInt()
  volumesCount?: number;

  @ApiPropertyOptional({ description: "MAL score", example: 7.55 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({
    description: "Image URLs as JSON object",
    example: { image_url: "https://example.com/image.jpg" },
  })
  @IsObject()
  images: object;

  @ApiProperty({ description: "Synopsis text" })
  @IsString()
  synopsis: string;

  @ApiProperty({
    description: "MAL URL",
    example: "https://myanimelist.net/manga/21479/Sword_Art_Online",
  })
  @IsString()
  malUrl: string;

  @ApiProperty({
    description: "Author names",
    example: ["Kawahara Reki"],
  })
  @IsArray()
  @IsString({ each: true })
  authors: string[];

  @ApiProperty({
    description: "Genre names",
    example: ["Action", "Adventure"],
  })
  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @ApiProperty({
    description: "Theme names",
    example: ["Isekai"],
  })
  @IsArray()
  @IsString({ each: true })
  themes: string[];
}

export class CreateLightNovelBulkDto {
  @ApiProperty({
    description: "Array of light novels to create",
    type: [CreateLightNovelItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLightNovelItemDto)
  data: CreateLightNovelItemDto[];
}
