import { Module } from "@nestjs/common";
import { LightNovelController } from "@/light-novel/light-novel.controller";
import { LightNovelService } from "@/light-novel/light-novel.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { LightNovelQueryBuilder } from "@/light-novel/light-novel-query-builder";
import { AuthorsModule } from "@/author/authors.module";
import { GenresModule } from "@/genre/genres.module";
import { ThemesModule } from "@/theme/themes.module";

@Module({
  imports: [AuthorsModule, GenresModule, ThemesModule],
  controllers: [LightNovelController],
  providers: [
    LightNovelService,
    { provide: CrudQueryBuilder, useClass: LightNovelQueryBuilder },
  ],
  exports: [LightNovelService],
})
export class LightNovelModule {}
