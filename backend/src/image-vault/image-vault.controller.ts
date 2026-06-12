import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query
} from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation
} from "@nestjs/swagger";

import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";
import { BulkDeleteUuidDto } from "@/common/dto";

import {
  CreateImageCategoryDto,
  CreateImageEntryDto,
  CreateImageModelDto,
  ImageCategoryResponseDto,
  ImageEntryListQueryDto,
  ImageEntryResponseDto,
  ImageModelResponseDto,
  PaginatedImageEntriesResponseDto,
  UpdateImageCategoryDto,
  UpdateImageEntryDto,
  UpdateImageModelDto
} from "@/image-vault/dto";
import { ImageVaultCategoryService } from "@/image-vault/image-vault-category.service";
import { ImageVaultModelService } from "@/image-vault/image-vault-model.service";
import { ImageVaultService } from "@/image-vault/image-vault.service";

@AuthenticatedApiController({
  tag: "Image Vault",
  path: "image-vault",
  errors: { notFound: "Image vault resource not found" }
})
export class ImageVaultController {
  constructor(
    private readonly imageVaultService: ImageVaultService,
    private readonly imageVaultModelService: ImageVaultModelService,
    private readonly imageVaultCategoryService: ImageVaultCategoryService
  ) {}

  @Get("images")
  @ApiOperation({ summary: "List image vault entries" })
  @ApiOkResponse({ type: PaginatedImageEntriesResponseDto })
  async listImages(
    @Query() query: ImageEntryListQueryDto
  ): Promise<PaginatedImageEntriesResponseDto> {
    return this.imageVaultService.findAllImages(query);
  }

  @Post("images")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create image vault entry metadata for a completed asset"
  })
  @ApiCreatedResponse({ type: ImageEntryResponseDto })
  async createImage(
    @Body() dto: CreateImageEntryDto
  ): Promise<ImageEntryResponseDto> {
    return this.imageVaultService.createImageEntry(dto);
  }

  @Get("images/:id/download-url")
  @ApiOperation({ summary: "Get presigned download URL for image vault entry" })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: { downloadUrl: { type: "string" } },
      required: ["downloadUrl"]
    }
  })
  async getImageDownloadUrl(@Param("id", ParseUUIDPipe) id: string) {
    const downloadUrl = await this.imageVaultService.getImageDownloadUrl(id);
    return { downloadUrl };
  }

  @Get("images/:id/source/download-url")
  @ApiOperation({
    summary: "Get presigned download URL for image vault source file"
  })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: { downloadUrl: { type: "string" } },
      required: ["downloadUrl"]
    }
  })
  async getSourceImageDownloadUrl(@Param("id", ParseUUIDPipe) id: string) {
    const downloadUrl =
      await this.imageVaultService.getSourceImageDownloadUrl(id);
    return { downloadUrl };
  }

  @Get("images/:id")
  @ApiOperation({ summary: "Get image entry detail" })
  @ApiOkResponse({ type: ImageEntryResponseDto })
  async getImage(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<ImageEntryResponseDto> {
    return this.imageVaultService.findImageById(id);
  }

  @Patch("images/:id")
  @ApiOperation({ summary: "Update image entry metadata" })
  @ApiOkResponse({ type: ImageEntryResponseDto })
  async updateImage(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateImageEntryDto
  ): Promise<ImageEntryResponseDto> {
    return this.imageVaultService.updateImage(id, dto);
  }

  @Delete("images/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete image entry and storage object" })
  @ApiNoContentResponse()
  async deleteImage(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.imageVaultService.deleteImage(id);
  }

  @Get("models")
  @ApiOperation({ summary: "List image generation models" })
  @ApiOkResponse({ type: [ImageModelResponseDto] })
  async listModels(): Promise<ImageModelResponseDto[]> {
    return this.imageVaultModelService.list();
  }

  @Post("models")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create image generation model" })
  @ApiCreatedResponse({ type: ImageModelResponseDto })
  async createModel(
    @Body() dto: CreateImageModelDto
  ): Promise<ImageModelResponseDto> {
    return this.imageVaultModelService.create(dto);
  }

  @Patch("models/:id")
  @ApiOperation({ summary: "Update image generation model" })
  @ApiOkResponse({ type: ImageModelResponseDto })
  async updateModel(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateImageModelDto
  ): Promise<ImageModelResponseDto> {
    return this.imageVaultModelService.update(id, dto);
  }

  @Delete("models")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete image generation models" })
  @ApiBody({ type: BulkDeleteUuidDto })
  @ApiNoContentResponse()
  async deleteModels(@Body() dto: BulkDeleteUuidDto): Promise<void> {
    return this.imageVaultModelService.deleteMany(dto.ids);
  }

  @Get("categories")
  @ApiOperation({ summary: "List image categories" })
  @ApiOkResponse({ type: [ImageCategoryResponseDto] })
  async listCategories(): Promise<ImageCategoryResponseDto[]> {
    return this.imageVaultCategoryService.list();
  }

  @Post("categories")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create image category" })
  @ApiCreatedResponse({ type: ImageCategoryResponseDto })
  async createCategory(
    @Body() dto: CreateImageCategoryDto
  ): Promise<ImageCategoryResponseDto> {
    return this.imageVaultCategoryService.create(dto);
  }

  @Patch("categories/:id")
  @ApiOperation({ summary: "Update image category" })
  @ApiOkResponse({ type: ImageCategoryResponseDto })
  async updateCategory(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateImageCategoryDto
  ): Promise<ImageCategoryResponseDto> {
    return this.imageVaultCategoryService.update(id, dto);
  }

  @Delete("categories")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete image categories" })
  @ApiBody({ type: BulkDeleteUuidDto })
  @ApiNoContentResponse()
  async deleteCategories(@Body() dto: BulkDeleteUuidDto): Promise<void> {
    return this.imageVaultCategoryService.deleteMany(dto.ids);
  }
}
