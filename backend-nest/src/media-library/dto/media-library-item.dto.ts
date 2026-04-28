import { ApiProperty } from "@nestjs/swagger";

import { AnimeListResponseDto } from "@/anime/dto/anime-list-response.dto";
import { LightNovelListResponseDto } from "@/light-novel/dto/light-novel-list-response.dto";
import { MangaListResponseDto } from "@/manga/dto/manga-list-response.dto";

export class AnimeMediaLibraryItemDto extends AnimeListResponseDto {
  @ApiProperty({
    enum: ["anime"],
    description: "Discriminator for the combined media library list"
  })
  mediaType: "anime";
}

export class MangaMediaLibraryItemDto extends MangaListResponseDto {
  @ApiProperty({
    enum: ["manga"],
    description: "Discriminator for the combined media library list"
  })
  mediaType: "manga";
}

export class LightNovelMediaLibraryItemDto extends LightNovelListResponseDto {
  @ApiProperty({
    enum: ["lightNovel"],
    description: "Discriminator for the combined media library list"
  })
  mediaType: "lightNovel";
}

export type MediaLibraryItemDto =
  | AnimeMediaLibraryItemDto
  | MangaMediaLibraryItemDto
  | LightNovelMediaLibraryItemDto;
