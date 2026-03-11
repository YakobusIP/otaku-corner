import { Module } from "@nestjs/common";
import { AnimeController } from "@/anime/anime.controller";
import { AnimeService } from "@/anime/anime.service";
import { AnimeQueryBuilder } from "@/anime/anime-query-builder";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { GenresModule } from "@/genre/genres.module";
import { StudiosModule } from "@/studio/studios.module";
import { ThemesModule } from "@/theme/themes.module";

@Module({
  imports: [GenresModule, StudiosModule, ThemesModule],
  controllers: [AnimeController],
  providers: [
    AnimeService,
    { provide: CrudQueryBuilder, useClass: AnimeQueryBuilder },
  ],
  exports: [AnimeService],
})
export class AnimeModule {}
