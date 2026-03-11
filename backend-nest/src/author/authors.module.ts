import { Module } from "@nestjs/common";
import { AuthorsController } from "@/author/authors.controller";
import { AuthorsService } from "@/author/authors.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { DefaultCrudQueryBuilder } from "@/common/crud/default-crud-query-builder";

@Module({
  controllers: [AuthorsController],
  providers: [
    AuthorsService,
    { provide: CrudQueryBuilder, useClass: DefaultCrudQueryBuilder },
  ],
  exports: [AuthorsService],
})
export class AuthorsModule {}
