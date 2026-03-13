import { Module } from "@nestjs/common";

import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";

import { AuthorsModule } from "@/author/authors.module";
import { GenresModule } from "@/genre/genres.module";
import { MangaQueryBuilder } from "@/manga/manga-query-builder";
import { MangaController } from "@/manga/manga.controller";
import { MangaService } from "@/manga/manga.service";
import { ThemesModule } from "@/theme/themes.module";

@Module({
  imports: [AuthorsModule, GenresModule, ThemesModule],
  controllers: [MangaController],
  providers: [
    MangaService,
    { provide: CrudQueryBuilder, useClass: MangaQueryBuilder }
  ],
  exports: [MangaService]
})
export class MangaModule {}
