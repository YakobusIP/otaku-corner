import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import type { CreateImageModelDto } from "@/image-vault/dto/create-image-model.dto";
import type { ImageModelResponseDto } from "@/image-vault/dto/image-model-response.dto";
import type { UpdateImageModelDto } from "@/image-vault/dto/update-image-model.dto";

import type { ImageVaultGenerationModel } from "@prisma/client";

@Injectable()
export class ImageVaultModelService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ImageModelResponseDto[]> {
    const rows = await this.prisma.imageVaultGenerationModel.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }]
    });
    return rows.map((row) => this.mapModel(row));
  }

  async create(dto: CreateImageModelDto): Promise<ImageModelResponseDto> {
    const row = await this.prisma.imageVaultGenerationModel.create({
      data: {
        name: dto.name.trim(),
        provider: dto.provider.trim(),
        isActive: dto.isActive ?? true
      }
    });
    return this.mapModel(row);
  }

  async update(
    id: string,
    dto: UpdateImageModelDto
  ): Promise<ImageModelResponseDto> {
    await this.assertExists(id);
    const row = await this.prisma.imageVaultGenerationModel.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        provider: dto.provider?.trim(),
        isActive: dto.isActive
      }
    });
    return this.mapModel(row);
  }

  async deleteMany(ids: string[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) {
      return;
    }

    const rows = await this.prisma.imageVaultGenerationModel.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        name: true,
        _count: { select: { images: true } }
      }
    });

    if (rows.length !== uniqueIds.length) {
      const foundIds = new Set(rows.map((row) => row.id));
      const missingId = uniqueIds.find((id) => !foundIds.has(id));
      throw new NotFoundException(`Image model "${missingId}" not found`);
    }

    const inUse = rows.filter((row) => row._count.images > 0);
    if (inUse.length > 0) {
      throw new BadRequestException(
        "Cannot delete models that are assigned to vault images"
      );
    }

    await this.prisma.imageVaultGenerationModel.deleteMany({
      where: { id: { in: uniqueIds } }
    });
  }

  async assertExists(id: string): Promise<void> {
    const row = await this.prisma.imageVaultGenerationModel.findUnique({
      where: { id }
    });
    if (!row) {
      throw new NotFoundException(`Image model "${id}" not found`);
    }
  }

  private mapModel(row: ImageVaultGenerationModel): ImageModelResponseDto {
    return {
      id: row.id,
      name: row.name,
      provider: row.provider,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}
