import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { Public } from "@/common/decorators/public.decorator";
import { PaginationQueryDto, BulkDeleteDto } from "@/common/dto";
import { BaseCrudController } from "@/common/crud/base-crud.controller";
import { AnimeService } from "@/anime/anime.service";
import {
  CreateAnimeItemDto,
  CreateAnimeBulkDto,
  UpdateAnimeDto,
  UpdateAnimeReviewDto,
  AnimeQueryDto,
  AnimeListResponseDto,
  PaginatedAnimeResponseDto,
  AnimeDetailResponseDto,
} from "@/anime/dto";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiBadRequestResponse({ description: "Validation failed" })
@ApiUnauthorizedResponse({ description: "Unauthorized" })
@ApiForbiddenResponse({ description: "Forbidden" })
@ApiNotFoundResponse({ description: "Anime not found" })
@ApiTags("animes")
@Controller("animes")
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
    type: PaginatedAnimeResponseDto,
  })
  async findAll(
    @Query() query: AnimeQueryDto,
  ): Promise<PaginatedAnimeResponseDto> {
    return this.service.findAll(query);
  }

  @Get("total")
  @Public()
  @ApiOperation({ summary: "Get total anime count" })
  @ApiResponse({
    status: 200,
    description: "Returns total number of anime",
    type: Number,
  })
  async getTotal(): Promise<number> {
    return this.service.getTotal();
  }

  @Get("sitemap")
  @Public()
  @ApiOperation({ summary: "Get anime data for sitemap generation" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: "Returns anime sitemap data",
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
  @ApiResponse({
    status: 200,
    description: "Returns whether anime exists",
    type: Boolean,
  })
  async checkDuplicate(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<boolean> {
    return this.service.checkDuplicate(id);
  }

  @Get("status-count")
  @Public()
  @ApiOperation({ summary: "Get anime counts grouped by progress status" })
  @ApiResponse({
    status: 200,
    description: "Returns status counts",
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
    type: AnimeDetailResponseDto,
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<AnimeDetailResponseDto> {
    return this.service.findOne(id);
  }

  @Post("bulk")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Bulk create anime" })
  @ApiBody({ type: CreateAnimeBulkDto })
  @ApiResponse({
    status: 201,
    description: "Anime created successfully",
  })
  async createBulk(@Body() dto: CreateAnimeBulkDto) {
    return this.service.createBulk(dto.data);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an anime" })
  @ApiParam({ name: "id", description: "Anime ID", type: Number })
  @ApiBody({ type: UpdateAnimeDto })
  @ApiResponse({
    status: 200,
    description: "Anime updated successfully",
    type: AnimeListResponseDto,
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAnimeDto,
  ): Promise<AnimeListResponseDto> {
    return this.baseUpdate(id, dto);
  }

  @Put(":id/review")
  @ApiOperation({ summary: "Update anime review" })
  @ApiParam({ name: "id", description: "Anime ID", type: Number })
  @ApiBody({ type: UpdateAnimeReviewDto })
  @ApiResponse({
    status: 200,
    description: "Anime review updated successfully",
  })
  async updateReview(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAnimeReviewDto,
  ) {
    return this.service.updateReview(id, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete multiple anime" })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 204,
    description: "Anime deleted successfully",
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
    description: "Anime deleted successfully",
  })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.baseDelete(id);
  }
}
