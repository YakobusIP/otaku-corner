import { Injectable } from "@nestjs/common";

import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import { EntityPaginationQueryDto } from "@/common/dto";
import { getOrCreateManyNameRows } from "@/common/utils/relation-get-or-create-many";

import { PrismaService } from "@/prisma/prisma.service";

import {
  CreateStudioDto,
  PaginatedStudiosResponseDto,
  StudioResponseDto,
  UpdateStudioDto
} from "@/studio/dto";

import { Prisma } from "@prisma/client";

@Injectable()
export class StudiosService extends BaseCrudService<
  CrudDelegate,
  CreateStudioDto,
  UpdateStudioDto,
  StudioResponseDto
> {
  protected readonly resourceName = "Studio";

  constructor(prisma: PrismaService, queryBuilder: CrudQueryBuilder) {
    super(prisma, queryBuilder);
  }

  protected getDelegate(
    client?: PrismaService | Prisma.TransactionClient
  ): CrudDelegate {
    return (client ?? this.prisma).studio;
  }

  async findAll(
    query: EntityPaginationQueryDto
  ): Promise<PaginatedStudiosResponseDto> {
    const includeIds = query.include_ids ?? [];
    if (includeIds.length > 0) {
      return super.findAll(query) as Promise<PaginatedStudiosResponseDto>;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { where } = this.queryBuilder.buildFindAllQuery(query);
    const connected = query.connected_media === true;

    const findArgs: Prisma.StudioFindManyArgs = {
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" }
    };

    if (connected) {
      findArgs.include = {
        _count: {
          select: { animes: true }
        }
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.studio.findMany(findArgs),
      this.prisma.studio.count({ where })
    ]);

    const data: StudioResponseDto[] = rows.map((row) => {
      const base: StudioResponseDto = {
        id: row.id,
        name: row.name,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };
      if (connected && "_count" in row && row._count) {
        const c = row._count as { animes: number };
        base.connectedMediaCount = c.animes;
      }
      return base;
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0
    };
  }

  async getOrCreateMany(names: string[]) {
    return getOrCreateManyNameRows(this.prisma.studio, names);
  }
}
