import { Injectable } from "@nestjs/common";

import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";

import { PrismaService } from "@/prisma/prisma.service";

import {
  AuthorResponseDto,
  CreateAuthorDto,
  UpdateAuthorDto
} from "@/author/dto";

import { Prisma } from "@prisma/client";

@Injectable()
export class AuthorsService extends BaseCrudService<
  CrudDelegate,
  CreateAuthorDto,
  UpdateAuthorDto,
  AuthorResponseDto
> {
  protected readonly resourceName = "Author";

  constructor(prisma: PrismaService, queryBuilder: CrudQueryBuilder) {
    super(prisma, queryBuilder);
  }

  protected getDelegate(
    client?: PrismaService | Prisma.TransactionClient
  ): CrudDelegate {
    return (client ?? this.prisma).author;
  }

  async getOrCreateMany(names: string[]) {
    const normalized = names.map((n) => n.trim());
    const existing = await this.prisma.author.findMany({
      where: { name: { in: normalized } }
    });
    const existingSet = new Set(existing.map((a) => a.name));
    const newNames = normalized.filter((n) => !existingSet.has(n));

    if (newNames.length === 0) return existing;

    const created = await this.prisma.author.createManyAndReturn({
      data: newNames.map((name) => ({ name })),
      skipDuplicates: true
    });

    return [...existing, ...created];
  }
}
