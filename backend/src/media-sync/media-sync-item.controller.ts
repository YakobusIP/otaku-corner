import { Body, Get, Param, Post, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";
import {
  CurrentUser,
  type CurrentUserPayload
} from "@/common/decorators/current-user.decorator";

import {
  MediaSyncConflictActionDto,
  MediaSyncItemDto,
  MediaSyncRunQueryDto,
  PaginatedOpenMediaSyncConflictsDto,
  ResolveMediaSyncFieldsDto
} from "@/media-sync/dto";
import { MediaSyncQueryService } from "@/media-sync/media-sync-query.service";
import { MediaSyncResolveService } from "@/media-sync/media-sync-resolve.service";

@AuthenticatedApiController({
  tag: "Media Sync",
  path: "media-sync-items"
})
export class MediaSyncItemController {
  constructor(
    private readonly mediaSyncResolveService: MediaSyncResolveService,
    private readonly mediaSyncQueryService: MediaSyncQueryService
  ) {}

  @Get("open-conflicts")
  @ApiOperation({
    summary: "List all open catalog sync conflicts across runs"
  })
  @ApiOkResponse({ type: PaginatedOpenMediaSyncConflictsDto })
  findOpenConflicts(
    @Query() query: MediaSyncRunQueryDto
  ): Promise<PaginatedOpenMediaSyncConflictsDto> {
    return this.mediaSyncQueryService.findOpenConflicts(query);
  }

  @Post(":id/accept-upstream")
  @ApiOperation({
    summary:
      "Accept the full pending upstream catalog snapshot for a conflicted sync item"
  })
  @ApiOkResponse({ type: MediaSyncItemDto })
  acceptUpstream(
    @Param("id") id: string,
    @Body() body: MediaSyncConflictActionDto,
    @CurrentUser() user: CurrentUserPayload
  ): Promise<MediaSyncItemDto> {
    return this.mediaSyncResolveService.acceptUpstream(id, body, user.userId);
  }

  @Post(":id/keep-existing")
  @ApiOperation({
    summary: "Keep the local catalog values for all open conflict fields"
  })
  @ApiOkResponse({ type: MediaSyncItemDto })
  keepExisting(
    @Param("id") id: string,
    @Body() body: MediaSyncConflictActionDto,
    @CurrentUser() user: CurrentUserPayload
  ): Promise<MediaSyncItemDto> {
    return this.mediaSyncResolveService.keepExisting(id, body, user.userId);
  }

  @Post(":id/resolve-fields")
  @ApiOperation({
    summary: "Resolve one or more open conflict fields with per-field choices"
  })
  @ApiOkResponse({ type: MediaSyncItemDto })
  resolveFields(
    @Param("id") id: string,
    @Body() body: ResolveMediaSyncFieldsDto,
    @CurrentUser() user: CurrentUserPayload
  ): Promise<MediaSyncItemDto> {
    return this.mediaSyncResolveService.resolveFields(id, body, user.userId);
  }
}
