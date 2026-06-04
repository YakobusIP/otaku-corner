import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

export class CreateMangaItemDto {
  @ApiProperty({ description: "MAL ID", example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ description: "URL slug", example: "berserk" })
  @IsString()
  slug: string;

  @ApiProperty({ description: "Publishing status", example: "Finished" })
  @IsString()
  status: string;

  @ApiProperty({ description: "Manga title", example: "Berserk" })
  @IsString()
  title: string;

  @ApiProperty({
    description: "Japanese title",
    example: "ベルセルク"
  })
  @IsString()
  titleJapanese: string;

  @ApiProperty({
    description: "Title synonyms (comma-separated)",
    example: "Berserk: The Prototype"
  })
  @IsString()
  titleSynonyms: string;

  @ApiProperty({
    description: "Published date range",
    example: "Aug 25, 1989 to Sep 10, 2021"
  })
  @IsString()
  published: string;

  @ApiPropertyOptional({ description: "Number of chapters", example: 364 })
  @IsOptional()
  @IsInt()
  chaptersCount?: number;

  @ApiPropertyOptional({ description: "Number of volumes", example: 41 })
  @IsOptional()
  @IsInt()
  volumesCount?: number;

  @ApiPropertyOptional({ description: "MAL score", example: 9.47 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({
    description: "Image URLs as JSON object",
    example: { image_url: "https://example.com/image.jpg" }
  })
  @IsObject()
  images: object;

  @ApiProperty({ description: "Synopsis text" })
  @IsString()
  synopsis: string;

  @ApiProperty({
    description: "MAL URL",
    example: "https://myanimelist.net/manga/2/Berserk"
  })
  @IsString()
  malUrl: string;

  @ApiProperty({
    description: "Author names",
    example: ["Miura, Kentarou"]
  })
  @IsArray()
  @IsString({ each: true })
  authors: string[];

  @ApiProperty({
    description: "Genre names",
    example: ["Action", "Adventure"]
  })
  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @ApiProperty({
    description: "Theme names",
    example: ["Military"]
  })
  @IsArray()
  @IsString({ each: true })
  themes: string[];
}

export class CreateMangaBulkDto {
  @ApiProperty({
    description: "Array of manga to create",
    type: [CreateMangaItemDto]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMangaItemDto)
  data: CreateMangaItemDto[];
}
