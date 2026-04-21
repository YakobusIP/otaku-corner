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

import { AnimeService } from "@/anime/anime.service";
import {
  AnimeDetailResponseDto,
  AnimeListResponseDto,
  AnimeQueryDto,
  AnimeTotalResponseDto,
  CreateAnimeBulkDto,
  CreateAnimeItemDto,
  DuplicateCheckResponseDto,
  PaginatedAnimeResponseDto,
  UpdateAnimeDto,
  UpdateAnimeReviewDto
} from "@/anime/dto";

import type { Request } from "express";

@AuthenticatedApiController({
  tag: "Animes",
  path: "animes",
  errors: { notFound: "Anime not found" }
})
export class AnimeController extends BaseCrudController<
  CreateAnimeItemDto,
  UpdateAnimeDto,
  AnimeListResponseDto,
  PaginatedAnimeResponseDto,
  AnimeService
> {
  constructor(service: AnimeService) {
    super(service);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all anime with filters and pagination" })
  @ApiResponse({
    status: 200,
    description: "Returns paginated list of anime",
    type: PaginatedAnimeResponseDto
  })
  async findAll(
    @Query() query: AnimeQueryDto
  ): Promise<PaginatedAnimeResponseDto> {
    return this.service.findAll(query);
  }

  @Get("total")
  @Public()
  @ApiOperation({ summary: "Get total anime count" })
  @ApiOkResponse({
    description: "Returns total number of anime",
    schema: {
      type: "object",
      required: ["count"],
      properties: {
        count: { type: "number", example: 42 }
      }
    }
  })
  async getTotal(): Promise<AnimeTotalResponseDto> {
    return this.service.getTotal();
  }

  @Get("sitemap")
  @Public()
  @ApiOperation({ summary: "Get anime data for sitemap generation" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: "Returns anime sitemap data"
  })
  async getSitemapData(@Query() query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.service.getSitemapData(page, limit);
  }

  @Get("duplicate/:id")
  @Public()
  @ApiOperation({ summary: "Check if anime exists by ID" })
  @ApiParam({ name: "id", description: "Anime MAL ID", type: Number })
  @ApiOkResponse({
    description: "Returns whether anime exists",
    schema: {
      type: "object",
      required: ["exists"],
      properties: {
        exists: { type: "boolean", example: true }
      }
    }
  })
  async checkDuplicate(
    @Param("id", ParseIntPipe) id: number
  ): Promise<DuplicateCheckResponseDto> {
    return this.service.checkDuplicate(id);
  }

  @Get("status-count")
  @Public()
  @ApiOperation({ summary: "Get anime counts grouped by progress status" })
  @ApiResponse({
    status: 200,
    description: "Returns status counts"
  })
  async getStatusCounts() {
    return this.service.getStatusCounts();
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get anime detail by ID" })
  @ApiParam({ name: "id", description: "Anime ID", type: Number })
  @ApiResponse({
    status: 200,
    description: "Returns anime detail",
    type: AnimeDetailResponseDto
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number
  ): Promise<AnimeDetailResponseDto> {
    return this.service.findOne(id);
  }

  @Post("bulk")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Bulk create anime" })
  @ApiBody({ type: CreateAnimeBulkDto })
  @ApiResponse({
    status: 201,
    description: "Anime created successfully"
  })
  async createBulk(@Body() dto: CreateAnimeBulkDto, @Req() req: Request) {
    return this.service.createBulk(
      dto.data,
      getRequestLogContextFromRequest(req)
    );
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an anime" })
  @ApiParam({ name: "id", description: "Anime ID", type: Number })
  @ApiBody({ type: UpdateAnimeDto })
  @ApiResponse({
    status: 200,
    description: "Anime updated successfully",
    type: AnimeListResponseDto
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAnimeDto
  ): Promise<AnimeListResponseDto> {
    return this.baseUpdate(id, dto);
  }

  @Put(":id/review")
  @ApiOperation({ summary: "Update anime review" })
  @ApiParam({ name: "id", description: "Anime ID", type: Number })
  @ApiBody({ type: UpdateAnimeReviewDto })
  @ApiResponse({
    status: 200,
    description: "Anime review updated successfully"
  })
  async updateReview(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAnimeReviewDto
  ) {
    return this.service.updateReview(id, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete multiple anime" })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 204,
    description: "Anime deleted successfully"
  })
  async deleteMany(@Body() bulkDeleteDto: BulkDeleteDto): Promise<void> {
    return this.baseDeleteMany(bulkDeleteDto.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an anime" })
  @ApiParam({ name: "id", description: "Anime ID", type: Number })
  @ApiResponse({
    status: 204,
    description: "Anime deleted successfully"
  })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.baseDelete(id);
  }
}
