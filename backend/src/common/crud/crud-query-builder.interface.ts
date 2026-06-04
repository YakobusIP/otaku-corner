import { PaginationQueryDto } from "@/common/dto";

export interface CrudQueryResult {
  where: Record<string, unknown>;
  skip: number;
  take: number;
  orderBy?: Record<string, unknown>;
  include?: Record<string, unknown>;
}

export abstract class CrudQueryBuilder {
  abstract buildFindAllQuery(query: PaginationQueryDto): CrudQueryResult;
}
