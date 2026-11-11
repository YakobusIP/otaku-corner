import { Module, forwardRef } from "@nestjs/common";

import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";

import { AnimeQueryBuilder } from "@/anime/anime-query-builder";
import { AnimeController } from "@/anime/anime.controller";
import { AnimeService } from "@/anime/anime.service";
import { FetchEpisodesQueueService } from "@/anime/fetch-episodes.queue";
import { GenresModule } from "@/genre/genres.module";
import { MediaSyncModule } from "@/media-sync/media-sync.module";
import { SettingsModule } from "@/settings/settings.module";
import { StudiosModule } from "@/studio/studios.module";
import { TenraiModule } from "@/tenrai/tenrai.module";
import { ThemesModule } from "@/theme/themes.module";

@Module({
  imports: [
    GenresModule,
    StudiosModule,
    ThemesModule,
    TenraiModule,
    SettingsModule,
    forwardRef(() => MediaSyncModule)
  ],
  controllers: [AnimeController],
  providers: [
    AnimeService,
    FetchEpisodesQueueService,
    { provide: CrudQueryBuilder, useClass: AnimeQueryBuilder }
  ],
  exports: [AnimeService, FetchEpisodesQueueService]
})
export class AnimeModule {}
