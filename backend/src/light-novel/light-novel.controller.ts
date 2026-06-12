import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req
} from "@nestjs/common";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse
} from "@nestjs/swagger";

import { BaseCrudController } from "@/common/crud/base-crud.controller";
import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";
import { Public } from "@/common/decorators/public.decorator";
import { BulkDeleteDto, PaginationQueryDto } from "@/common/dto";
import { getRequestLogContextFromRequest } from "@/common/logging/request-log-context";

import {
  CreateLightNovelBulkDto,
  CreateLightNovelItemDto,
  DuplicateCheckResponseDto,
  LightNovelDetailResponseDto,
  LightNovelListResponseDto,
  LightNovelQueryDto,
  LightNovelTotalResponseDto,
  PaginatedLightNovelResponseDto,
  UpdateLightNovelDto,
  UpdateLightNovelReviewDto,
  UpdateVolumeProgressDto
} from "@/light-novel/dto";
import { LightNovelService } from "@/light-novel/light-novel.service";

import type { Request } from "express";

@AuthenticatedApiController({
  tag: "Light Novels",
  path: "light-novels",
  errors: { notFound: "Light novel not found" }
})
export class LightNovelController extends BaseCrudController<
  CreateLightNovelItemDto,
  UpdateLightNovelDto,
  LightNovelListResponseDto,
  PaginatedLightNovelResponseDto,
  LightNovelService
> {
  constructor(service: LightNovelService) {
    super(service);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all light novels with filters and pagination" })
  @ApiResponse({
    status: 200,
    description: "Returns paginated list of light novels",
    type: PaginatedLightNovelResponseDto
  })
  async findAll(
    @Query() query: LightNovelQueryDto
  ): Promise<PaginatedLightNovelResponseDto> {
    return this.service.findAll(query);
  }

  @Get("total")
  @Public()
  @ApiOperation({ summary: "Get total light novel count" })
  @ApiOkResponse({
    description: "Returns total number of light novels",
    type: LightNovelTotalResponseDto
  })
  async getTotal(): Promise<LightNovelTotalResponseDto> {
    return this.service.getTotal();
  }

  @Get("sitemap")
  @Public()
  @ApiOperation({ summary: "Get light novel data for sitemap generation" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: "Returns light novel sitemap data"
  })
  async getSitemapData(@Query() query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.service.getSitemapData(page, limit);
  }

  @Get("duplicate/:id")
  @Public()
  @ApiOperation({ summary: "Check if a light novel exists by ID" })
  @ApiParam({ name: "id", description: "Light novel MAL ID", type: Number })
  @ApiOkResponse({
    description: "Returns whether the light novel exists",
    type: DuplicateCheckResponseDto
  })
  async checkDuplicate(
    @Param("id", ParseIntPipe) id: number
  ): Promise<DuplicateCheckResponseDto> {
    return this.service.checkDuplicate(id);
  }

  @Get("status-count")
  @Public()
  @ApiOperation({
    summary: "Get light novel counts grouped by progress status (includes All)"
  })
  @ApiResponse({
    status: 200,
    description: "Returns status counts"
  })
  async getStatusCounts() {
    return this.service.getStatusCounts();
  }

  @Post(":id/metadata-sync")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary:
      "Enqueue RanobeDB volume sync (volumesCount and volume progress rows) for this light novel"
  })
  @ApiParam({ name: "id", description: "Light novel ID", type: Number })
  @ApiResponse({
    status: 202,
    description: "Job accepted on the fetch queue (processed asynchronously)"
  })
  async enqueueMetadataSync(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request
  ): Promise<{ queued: true }> {
    await this.service.enqueueExternalMetadataSync(
      id,
      getRequestLogContextFromRequest(req)
    );
    return { queued: true };
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get light novel detail by ID" })
  @ApiParam({ name: "id", description: "Light novel ID", type: Number })
  @ApiResponse({
    status: 200,
    description: "Returns light novel detail",
    type: LightNovelDetailResponseDto
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number
  ): Promise<LightNovelDetailResponseDto> {
    return this.service.findOne(id);
  }

  @Post("bulk")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Bulk create light novels" })
  @ApiBody({ type: CreateLightNovelBulkDto })
  @ApiResponse({
    status: 201,
    description: "Light novels created successfully"
  })
  async createBulk(@Body() dto: CreateLightNovelBulkDto, @Req() req: Request) {
    return this.service.createBulk(
      dto.data,
      getRequestLogContextFromRequest(req)
    );
  }

  @Put("volume-progress")
  @ApiOperation({ summary: "Update volume progress" })
  @ApiBody({ type: UpdateVolumeProgressDto })
  @ApiResponse({
    status: 200,
    description: "Volume progress updated successfully"
  })
  async updateVolumeProgress(
    @Body() dto: UpdateVolumeProgressDto
  ): Promise<void> {
    return this.service.updateVolumeProgress(dto.data);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a light novel" })
  @ApiParam({ name: "id", description: "Light novel ID", type: Number })
  @ApiBody({ type: UpdateLightNovelDto })
  @ApiResponse({
    status: 200,
    description: "Light novel updated successfully",
    type: LightNovelListResponseDto
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateLightNovelDto
  ): Promise<LightNovelListResponseDto> {
    return this.baseUpdate(id, dto);
  }

  @Put(":id/review")
  @ApiOperation({ summary: "Update light novel review" })
  @ApiParam({ name: "id", description: "Light novel ID", type: Number })
  @ApiBody({ type: UpdateLightNovelReviewDto })
  @ApiResponse({
    status: 200,
    description: "Light novel review updated successfully"
  })
  async updateReview(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateLightNovelReviewDto
  ) {
    return this.service.updateReview(id, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete multiple light novels" })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 204,
    description: "Light novels deleted successfully"
  })
  async deleteMany(@Body() bulkDeleteDto: BulkDeleteDto): Promise<void> {
    return this.baseDeleteMany(bulkDeleteDto.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a light novel" })
  @ApiParam({ name: "id", description: "Light novel ID", type: Number })
  @ApiResponse({
    status: 204,
    description: "Light novel deleted successfully"
  })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.baseDelete(id);
  }
}
