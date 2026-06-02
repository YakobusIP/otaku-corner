import { Get, Query } from "@nestjs/common";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse
} from "@nestjs/swagger";

import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";
import { Public } from "@/common/decorators/public.decorator";

import {
  AnimeMediaLibraryItemDto,
  LightNovelMediaLibraryItemDto,
  MangaMediaLibraryItemDto,
  MediaLibraryQueryDto,
  PaginatedMediaLibraryResponseDto
} from "@/media-library/dto";
import { MediaLibraryService } from "@/media-library/media-library.service";

@AuthenticatedApiController({
  tag: "Media library",
  path: "media-library",
  errors: { notFound: "Not found" }
})
export class MediaLibraryController {
  constructor(private readonly mediaLibraryService: MediaLibraryService) {}

  @Get()
  @Public()
  @ApiExtraModels(
    AnimeMediaLibraryItemDto,
    MangaMediaLibraryItemDto,
    LightNovelMediaLibraryItemDto
  )
  @ApiOperation({
    summary: "List anime, manga, and light novel in one response"
  })
  @ApiOkResponse({ type: PaginatedMediaLibraryResponseDto })
  @ApiResponse({
    status: 200,
    description: "Each item includes mediaType (anime | manga | lightNovel)"
  })
  async findAll(
    @Query() query: MediaLibraryQueryDto
  ): Promise<PaginatedMediaLibraryResponseDto> {
    return this.mediaLibraryService.findAll(query);
  }
}
