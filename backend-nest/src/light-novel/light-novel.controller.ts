import {
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
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";
import { PaginationQueryDto, BulkDeleteDto } from "@/common/dto";
import { LightNovelService } from "@/light-novel/light-novel.service";
import {
  LightNovelQueryDto,
  CreateLightNovelBulkDto,
  UpdateLightNovelDto,
  UpdateLightNovelReviewDto,
  UpdateVolumeProgressDto,
  PaginatedLightNovelResponseDto,
  LightNovelDetailResponseDto,
} from "@/light-novel/dto";

@AuthenticatedApiController({
  tag: "Light Novels",
  path: "light-novels",
  errors: { notFound: "Light novel not found" },
})
export class LightNovelController {
  constructor(private readonly service: LightNovelService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all light novels" })
  @ApiResponse({
    status: 200,
    description: "Returns list of light novels",
    type: PaginatedLightNovelResponseDto,
  })
  async findAll(
    @Query() query: LightNovelQueryDto,
  ): Promise<PaginatedLightNovelResponseDto> {
    return this.service.findAll(
      query,
    ) as Promise<PaginatedLightNovelResponseDto>;
  }

  @Get("total")
  @Public()
  @ApiOperation({ summary: "Get total light novel count" })
  @ApiResponse({
    status: 200,
    description: "Returns total count",
  })
  async getTotal(): Promise<{ total: number }> {
    return this.service.getTotal();
  }

  @Get("sitemap")
  @Public()
  @ApiOperation({ summary: "Get sitemap data for light novels" })
  @ApiResponse({
    status: 200,
    description: "Returns sitemap data",
  })
  async getSitemapData(@Query() query: PaginationQueryDto) {
    return this.service.getSitemapData(query);
  }

  @Get("duplicate/:id")
  @ApiOperation({ summary: "Check if a light novel exists by ID" })
  @ApiParam({
    name: "id",
    description: "Light novel ID",
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Returns duplicate check result",
  })
  async checkDuplicate(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ exists: boolean }> {
    return this.service.checkDuplicate(id);
  }

  @Get("status-count")
  @Public()
  @ApiOperation({ summary: "Get light novel counts by progress status" })
  @ApiResponse({
    status: 200,
    description: "Returns status counts",
  })
  async getStatusCounts(): Promise<Record<string, number>> {
    return this.service.getStatusCounts();
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get a light novel by ID" })
  @ApiParam({
    name: "id",
    description: "Light novel ID",
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Returns the light novel detail",
    type: LightNovelDetailResponseDto,
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<LightNovelDetailResponseDto> {
    return this.service.findOne(id);
  }

  @Post("bulk")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create light novels in bulk" })
  @ApiBody({ type: CreateLightNovelBulkDto })
  @ApiResponse({
    status: 201,
    description: "Light novels created successfully",
  })
  async createBulk(
    @Body() dto: CreateLightNovelBulkDto,
  ): Promise<{ count: number }> {
    return this.service.createBulk(dto.data);
  }

  @Put("volume-progress")
  @ApiOperation({ summary: "Update volume progress" })
  @ApiBody({ type: UpdateVolumeProgressDto })
  @ApiResponse({
    status: 200,
    description: "Volume progress updated successfully",
  })
  async updateVolumeProgress(
    @Body() dto: UpdateVolumeProgressDto,
  ): Promise<void> {
    return this.service.updateVolumeProgress(dto.data);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a light novel" })
  @ApiParam({
    name: "id",
    description: "Light novel ID",
    example: 1,
    type: Number,
  })
  @ApiBody({ type: UpdateLightNovelDto })
  @ApiResponse({
    status: 200,
    description: "Light novel updated successfully",
    type: LightNovelDetailResponseDto,
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateLightNovelDto,
  ): Promise<LightNovelDetailResponseDto> {
    return this.service.updateLightNovel(id, dto);
  }

  @Put(":id/review")
  @ApiOperation({ summary: "Update a light novel review" })
  @ApiParam({
    name: "id",
    description: "Light novel ID",
    example: 1,
    type: Number,
  })
  @ApiBody({ type: UpdateLightNovelReviewDto })
  @ApiResponse({
    status: 200,
    description: "Review updated successfully",
    type: LightNovelDetailResponseDto,
  })
  async updateReview(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateLightNovelReviewDto,
  ): Promise<LightNovelDetailResponseDto> {
    return this.service.updateReview(id, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete multiple light novels" })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 204,
    description: "Light novels deleted successfully",
  })
  async deleteMany(@Body() bulkDeleteDto: BulkDeleteDto): Promise<void> {
    return this.service.deleteMany(bulkDeleteDto.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a light novel" })
  @ApiParam({
    name: "id",
    description: "Light novel ID",
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: "Light novel deleted successfully",
  })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.service.delete(id);
  }
}
