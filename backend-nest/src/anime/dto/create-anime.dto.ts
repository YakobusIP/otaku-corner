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

export class CreateAnimeEpisodeDto {
  @ApiProperty({ description: "Episode aired date", example: "2024-01-01" })
  @IsString()
  aired: string;

  @ApiProperty({ description: "Episode number", example: 1 })
  @IsInt()
  number: number;

  @ApiProperty({ description: "Episode title", example: "The Beginning" })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: "Episode title in Japanese",
    example: "始まり"
  })
  @IsOptional()
  @IsString()
  titleJapanese?: string;

  @ApiPropertyOptional({
    description: "Episode title in Romaji",
    example: "Hajimari"
  })
  @IsOptional()
  @IsString()
  titleRomaji?: string;
}

export class CreateAnimeItemDto {
  @ApiProperty({ description: "MAL ID", example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ description: "URL slug", example: "cowboy-bebop" })
  @IsString()
  slug: string;

  @ApiProperty({ description: "Anime type", example: "TV" })
  @IsString()
  type: string;

  @ApiProperty({ description: "Airing status", example: "Finished Airing" })
  @IsString()
  status: string;

  @ApiProperty({ description: "Age rating", example: "R" })
  @IsString()
  rating: string;

  @ApiPropertyOptional({ description: "Season", example: "spring" })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiProperty({ description: "Anime title", example: "Cowboy Bebop" })
  @IsString()
  title: string;

  @ApiProperty({
    description: "Japanese title",
    example: "カウボーイビバップ"
  })
  @IsString()
  titleJapanese: string;

  @ApiProperty({
    description: "Title synonyms (comma-separated)",
    example: "CB"
  })
  @IsString()
  titleSynonyms: string;

  @ApiProperty({ description: "Source material", example: "Original" })
  @IsString()
  source: string;

  @ApiProperty({
    description: "Aired date range",
    example: "Apr 3, 1998 to Apr 24, 1999"
  })
  @IsString()
  aired: string;

  @ApiProperty({
    description: "Broadcast schedule",
    example: "Saturdays at 01:00 (JST)"
  })
  @IsString()
  broadcast: string;

  @ApiPropertyOptional({ description: "Number of episodes", example: 26 })
  @IsOptional()
  @IsInt()
  episodesCount?: number;

  @ApiProperty({ description: "Episode duration", example: "24 min per ep" })
  @IsString()
  duration: string;

  @ApiPropertyOptional({ description: "MAL score", example: 8.78 })
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

  @ApiPropertyOptional({
    description: "Trailer URL",
    example: "https://youtube.com/watch?v=xxx"
  })
  @IsOptional()
  @IsString()
  trailer?: string;

  @ApiProperty({
    description: "MAL URL",
    example: "https://myanimelist.net/anime/1/Cowboy_Bebop"
  })
  @IsString()
  malUrl: string;

  @ApiProperty({
    description: "Episodes data",
    type: [CreateAnimeEpisodeDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnimeEpisodeDto)
  episodes: CreateAnimeEpisodeDto[];

  @ApiProperty({
    description: "Genre names",
    example: ["Action", "Adventure"]
  })
  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @ApiProperty({
    description: "Studio names",
    example: ["Sunrise"]
  })
  @IsArray()
  @IsString({ each: true })
  studios: string[];

  @ApiProperty({
    description: "Theme names",
    example: ["Space"]
  })
  @IsArray()
  @IsString({ each: true })
  themes: string[];
}

export class CreateAnimeBulkDto {
  @ApiProperty({
    description: "Array of anime to create",
    type: [CreateAnimeItemDto]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateAnimeItemDto)
  data: CreateAnimeItemDto[];
}
