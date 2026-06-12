import { ApiPropertyOptional } from "@nestjs/swagger";

import {
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString
} from "class-validator";

export class UpdateAnimeDto {
  @ApiPropertyOptional({ description: "URL slug" })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: "Anime type" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: "Airing status" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: "Age rating" })
  @IsOptional()
  @IsString()
  rating?: string;

  @ApiPropertyOptional({ description: "Season" })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiPropertyOptional({ description: "Anime title" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: "Japanese title" })
  @IsOptional()
  @IsString()
  titleJapanese?: string;

  @ApiPropertyOptional({ description: "Title synonyms" })
  @IsOptional()
  @IsString()
  titleSynonyms?: string;

  @ApiPropertyOptional({ description: "Source material" })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: "Aired date range" })
  @IsOptional()
  @IsString()
  aired?: string;

  @ApiPropertyOptional({ description: "Broadcast schedule" })
  @IsOptional()
  @IsString()
  broadcast?: string;

  @ApiPropertyOptional({ description: "Number of episodes" })
  @IsOptional()
  @IsInt()
  episodesCount?: number;

  @ApiPropertyOptional({ description: "Episode duration" })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: "MAL score" })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ description: "Image URLs as JSON object" })
  @IsOptional()
  @IsObject()
  images?: object;

  @ApiPropertyOptional({ description: "Synopsis text" })
  @IsOptional()
  @IsString()
  synopsis?: string;

  @ApiPropertyOptional({ description: "Trailer URL" })
  @IsOptional()
  @IsString()
  trailer?: string;

  @ApiPropertyOptional({ description: "MAL URL" })
  @IsOptional()
  @IsString()
  malUrl?: string;
}
