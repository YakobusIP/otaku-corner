import { Module } from "@nestjs/common";
import { ThemesController } from "@/theme/themes.controller";
import { ThemesService } from "@/theme/themes.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { DefaultCrudQueryBuilder } from "@/common/crud/default-crud-query-builder";

@Module({
  controllers: [ThemesController],
  providers: [
    ThemesService,
    { provide: CrudQueryBuilder, useClass: DefaultCrudQueryBuilder },
  ],
  exports: [ThemesService],
})
export class ThemesModule {}
