import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CreateThemeDto, UpdateThemeDto, ThemeResponseDto } from "@/theme/dto";

@Injectable()
export class ThemesService extends BaseCrudService<
  CrudDelegate,
  CreateThemeDto,
  UpdateThemeDto,
  ThemeResponseDto
> {
  protected readonly resourceName = "Theme";

  constructor(prisma: PrismaService, queryBuilder: CrudQueryBuilder) {
    super(prisma, queryBuilder);
  }

  protected getDelegate(
    client?: PrismaService | Prisma.TransactionClient,
  ): CrudDelegate {
    return (client ?? this.prisma).theme;
  }

  async getOrCreateMany(names: string[]) {
    const normalized = names.map((n) => n.trim());
    const existing = await this.prisma.theme.findMany({
      where: { name: { in: normalized } },
    });
    const existingSet = new Set(existing.map((t) => t.name));
    const newNames = normalized.filter((n) => !existingSet.has(n));

    if (newNames.length === 0) return existing;

    const created = await this.prisma.theme.createManyAndReturn({
      data: newNames.map((name) => ({ name })),
      skipDuplicates: true,
    });

    return [...existing, ...created];
  }
}
