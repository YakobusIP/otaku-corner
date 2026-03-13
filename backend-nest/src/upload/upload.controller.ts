import {
  Body,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";

import { UploadImageDto, UploadResponseDto } from "@/upload/dto";
import { MediaType } from "@/upload/enums/media-type.enum";
import { UploadService } from "@/upload/upload.service";

@AuthenticatedApiController({ tag: "Upload", path: "upload" })
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  @ApiOperation({ summary: "Upload a review image" })
  @ApiConsumes("multipart/form-data")
  @ApiBadRequestResponse({ description: "Validation failed" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiResponse({
    status: 201,
    description: "Image uploaded successfully",
    type: UploadResponseDto
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImageDto
  ): Promise<UploadResponseDto> {
    return this.uploadService.uploadImage(
      file,
      dto.type as MediaType,
      dto.reviewId
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a review image" })
  @ApiParam({ name: "id", description: "Image ID (UUID)", type: String })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiNotFoundResponse({ description: "Image not found" })
  @ApiResponse({
    status: 200,
    description: "Image deleted successfully"
  })
  async deleteImage(@Param("id") id: string): Promise<{ message: string }> {
    await this.uploadService.deleteImage(id);
    return { message: "Image deleted successfully" };
  }
}
