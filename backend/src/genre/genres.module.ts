import { Module } from "@nestjs/common";

import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { DefaultCrudQueryBuilder } from "@/common/crud/default-crud-query-builder";

import { GenresController } from "@/genre/genres.controller";
import { GenresService } from "@/genre/genres.service";

@Module({
  controllers: [GenresController],
  providers: [
    GenresService,
    { provide: CrudQueryBuilder, useClass: DefaultCrudQueryBuilder }
  ],
  exports: [GenresService]
})
export class GenresModule {}
