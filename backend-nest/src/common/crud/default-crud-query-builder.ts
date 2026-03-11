import { Injectable } from "@nestjs/common";
import { PaginationQueryDto } from "@/common/dto";
import {
  CrudQueryBuilder,
  CrudQueryResult,
} from "@/common/crud/crud-query-builder.interface";

@Injectable()
export class DefaultCrudQueryBuilder implements CrudQueryBuilder {
  buildFindAllQuery(query: PaginationQueryDto): CrudQueryResult {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Record<string, unknown> = {};

    if (query.query) {
      where.name = { contains: query.query, mode: "insensitive" };
    }

    return {
      where,
      skip: (page - 1) * limit,
      take: limit,
    };
  }
}
