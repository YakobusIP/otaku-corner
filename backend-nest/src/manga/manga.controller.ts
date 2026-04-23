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
  CreateMangaBulkDto,
  CreateMangaItemDto,
  DuplicateCheckResponseDto,
  MangaDetailResponseDto,
  MangaListResponseDto,
  MangaQueryDto,
  MangaTotalResponseDto,
  PaginatedMangaResponseDto,
  UpdateMangaDto,
  UpdateMangaReviewDto
} from "@/manga/dto";
import { MangaService } from "@/manga/manga.service";

import type { Request } from "express";

@AuthenticatedApiController({
  tag: "Mangas",
  path: "mangas",
  errors: { notFound: "Manga not found" }
})
export class MangaController extends BaseCrudController<
  CreateMangaItemDto,
  UpdateMangaDto,
  MangaListResponseDto,
  PaginatedMangaResponseDto,
  MangaService
> {
  constructor(service: MangaService) {
    super(service);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all manga with filters and pagination" })
  @ApiResponse({
    status: 200,
    description: "Returns paginated list of manga",
    type: PaginatedMangaResponseDto
  })
  async findAll(
    @Query() query: MangaQueryDto
  ): Promise<PaginatedMangaResponseDto> {
    return this.service.findAll(query);
  }

  @Get("total")
  @Public()
  @ApiOperation({ summary: "Get total manga count" })
  @ApiOkResponse({
    description: "Returns total number of manga",
    type: MangaTotalResponseDto
  })
  async getTotal(): Promise<MangaTotalResponseDto> {
    return this.service.getTotal();
  }

  @Get("sitemap")
  @Public()
  @ApiOperation({ summary: "Get manga data for sitemap generation" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: "Returns manga sitemap data"
  })
  async getSitemapData(@Query() query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.service.getSitemapData(page, limit);
  }

  @Get("duplicate/:id")
  @Public()
  @ApiOperation({ summary: "Check if manga exists by ID" })
  @ApiParam({ name: "id", description: "Manga MAL ID", type: Number })
  @ApiOkResponse({
    description: "Returns whether manga exists",
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
    summary: "Get manga counts grouped by progress status (includes All bucket)"
  })
  @ApiResponse({
    status: 200,
    description: "Returns status counts"
  })
  async getStatusCounts() {
    return this.service.getStatusCounts();
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get manga detail by ID" })
  @ApiParam({ name: "id", description: "Manga ID", type: Number })
  @ApiResponse({
    status: 200,
    description: "Returns manga detail",
    type: MangaDetailResponseDto
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number
  ): Promise<MangaDetailResponseDto> {
    return this.service.findOne(id);
  }

  @Post("bulk")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Bulk create manga" })
  @ApiBody({ type: CreateMangaBulkDto })
  @ApiResponse({
    status: 201,
    description: "Manga created successfully"
  })
  async createBulk(@Body() dto: CreateMangaBulkDto, @Req() req: Request) {
    return this.service.createBulk(
      dto.data,
      getRequestLogContextFromRequest(req)
    );
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a manga" })
  @ApiParam({ name: "id", description: "Manga ID", type: Number })
  @ApiBody({ type: UpdateMangaDto })
  @ApiResponse({
    status: 200,
    description: "Manga updated successfully",
    type: MangaListResponseDto
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateMangaDto
  ): Promise<MangaListResponseDto> {
    return this.baseUpdate(id, dto);
  }

  @Put(":id/review")
  @ApiOperation({ summary: "Update manga review" })
  @ApiParam({ name: "id", description: "Manga ID", type: Number })
  @ApiBody({ type: UpdateMangaReviewDto })
  @ApiResponse({
    status: 200,
    description: "Manga review updated successfully"
  })
  async updateReview(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateMangaReviewDto
  ) {
    return this.service.updateReview(id, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete multiple manga" })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 204,
    description: "Manga deleted successfully"
  })
  async deleteMany(@Body() bulkDeleteDto: BulkDeleteDto): Promise<void> {
    return this.baseDeleteMany(bulkDeleteDto.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a manga" })
  @ApiParam({ name: "id", description: "Manga ID", type: Number })
  @ApiResponse({
    status: 204,
    description: "Manga deleted successfully"
  })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.baseDelete(id);
  }
}
