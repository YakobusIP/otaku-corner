import { ApiProperty, getSchemaPath } from "@nestjs/swagger";

import {
  AnimeMediaLibraryItemDto,
  LightNovelMediaLibraryItemDto,
  MangaMediaLibraryItemDto,
  type MediaLibraryItemDto
} from "@/media-library/dto/media-library-item.dto";

export class PaginatedMediaLibraryResponseDto {
  @ApiProperty({
    description:
      "Each item is one of the list row shapes, plus mediaType (anime | manga | lightNovel)",
    type: "array",
    items: {
      oneOf: [
        { $ref: getSchemaPath(AnimeMediaLibraryItemDto) },
        { $ref: getSchemaPath(MangaMediaLibraryItemDto) },
        { $ref: getSchemaPath(LightNovelMediaLibraryItemDto) }
      ]
    }
  })
  data: MediaLibraryItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
