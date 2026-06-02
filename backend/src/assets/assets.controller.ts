import {
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post
} from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiServiceUnavailableResponse
} from "@nestjs/swagger";

import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";

import { AssetsService } from "@/assets/assets.service";
import {
  CompleteAssetResponseDto,
  InitAssetDto,
  InitAssetResponseDto
} from "@/assets/dto";

@AuthenticatedApiController({ tag: "Assets", path: "assets" })
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post("init")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create asset record and presigned PUT URL" })
  @ApiCreatedResponse({ type: InitAssetResponseDto })
  async init(@Body() dto: InitAssetDto): Promise<InitAssetResponseDto> {
    return this.assetsService.init(dto);
  }

  @Post(":assetId/complete")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify object in R2 and mark asset READY" })
  @ApiParam({ name: "assetId", format: "uuid" })
  @ApiOkResponse({ type: CompleteAssetResponseDto })
  @ApiConflictResponse({
    description: "Object not visible yet; retry after PUT completes"
  })
  @ApiServiceUnavailableResponse({
    description: "Storage unavailable; safe to retry"
  })
  async complete(
    @Param("assetId", ParseUUIDPipe) assetId: string
  ): Promise<CompleteAssetResponseDto> {
    return this.assetsService.complete(assetId);
  }

  @Delete(":assetId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete asset object and records" })
  @ApiParam({ name: "assetId", format: "uuid" })
  @ApiResponse({
    status: 200,
    description: "Deleted",
    schema: { example: { message: "Asset deleted successfully" } }
  })
  @ApiServiceUnavailableResponse({
    description: "Storage deletion failed; DB unchanged"
  })
  async delete(
    @Param("assetId", ParseUUIDPipe) assetId: string
  ): Promise<{ message: string }> {
    await this.assetsService.delete(assetId);
    return { message: "Asset deleted successfully" };
  }
}
