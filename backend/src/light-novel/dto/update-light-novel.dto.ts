import { ApiPropertyOptional } from "@nestjs/swagger";

import {
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString
} from "class-validator";

export class UpdateLightNovelDto {
  @ApiPropertyOptional({ description: "URL slug" })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: "Publishing status" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: "Light novel title" })
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

  @ApiPropertyOptional({ description: "Published date range" })
  @IsOptional()
  @IsString()
  published?: string;

  @ApiPropertyOptional({ description: "Number of volumes" })
  @IsOptional()
  @IsInt()
  volumesCount?: number;

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

  @ApiPropertyOptional({ description: "MAL URL" })
  @IsOptional()
  @IsString()
  malUrl?: string;
}
