import { Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";

import {
  MediaSyncItemQueryDto,
  MediaSyncRunDetailDto,
  MediaSyncRunQueryDto,
  PaginatedMediaSyncRunResponseDto
} from "@/media-sync/dto";
import { MediaSyncQueryService } from "@/media-sync/media-sync-query.service";

@AuthenticatedApiController({
  tag: "Media Sync",
  path: "media-sync-runs"
})
export class MediaSyncController {
  constructor(private readonly mediaSyncQueryService: MediaSyncQueryService) {}

  @Get()
  @ApiOkResponse({ type: PaginatedMediaSyncRunResponseDto })
  findRuns(
    @Query() query: MediaSyncRunQueryDto
  ): Promise<PaginatedMediaSyncRunResponseDto> {
    return this.mediaSyncQueryService.findRuns(query);
  }

  @Get(":id")
  @ApiOkResponse({ type: MediaSyncRunDetailDto })
  findRunDetail(
    @Param("id") id: string,
    @Query() query: MediaSyncItemQueryDto
  ): Promise<MediaSyncRunDetailDto> {
    return this.mediaSyncQueryService.findRunDetail(id, query);
  }
}
