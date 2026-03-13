import { Module } from "@nestjs/common";

import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { DefaultCrudQueryBuilder } from "@/common/crud/default-crud-query-builder";

import { ThemesController } from "@/theme/themes.controller";
import { ThemesService } from "@/theme/themes.service";

@Module({
  controllers: [ThemesController],
  providers: [
    ThemesService,
    { provide: CrudQueryBuilder, useClass: DefaultCrudQueryBuilder }
  ],
  exports: [ThemesService]
})
export class ThemesModule {}
