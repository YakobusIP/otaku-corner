import { Module } from "@nestjs/common";
import { StudiosController } from "@/studio/studios.controller";
import { StudiosService } from "@/studio/studios.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { DefaultCrudQueryBuilder } from "@/common/crud/default-crud-query-builder";

@Module({
  controllers: [StudiosController],
  providers: [
    StudiosService,
    { provide: CrudQueryBuilder, useClass: DefaultCrudQueryBuilder },
  ],
  exports: [StudiosService],
})
export class StudiosModule {}
