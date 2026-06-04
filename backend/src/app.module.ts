import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { BullQueueModule } from "@/common/bull/bull-queue.module";
import { PrismaExceptionFilter } from "@/common/filters/prisma-exception.filter";
import { LoggingModule } from "@/common/logging/logging.module";

import { PrismaModule } from "@/prisma/prisma.module";

import { AuthModule } from "@/auth/auth.module";

import { AnimeModule } from "@/anime/anime.module";
import { AppController } from "@/app.controller";
import { AppService } from "@/app.service";
import { AssetsModule } from "@/assets/assets.module";
import { AuthorsModule } from "@/author/authors.module";
import { validateEnv } from "@/config/validate-env";
import { GenresModule } from "@/genre/genres.module";
import { LightNovelModule } from "@/light-novel/light-novel.module";
import { MangaModule } from "@/manga/manga.module";
import { MediaLibraryModule } from "@/media-library/media-library.module";
import { StatisticModule } from "@/statistic/statistic.module";
import { StorageModule } from "@/storage/storage.module";
import { StudiosModule } from "@/studio/studios.module";
import { ThemesModule } from "@/theme/themes.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv
    }),
    StorageModule,
    LoggingModule,
    BullQueueModule,
    PrismaModule,
    AuthModule,
    AuthorsModule,
    GenresModule,
    StudiosModule,
    ThemesModule,
    AnimeModule,
    MangaModule,
    LightNovelModule,
    MediaLibraryModule,
    StatisticModule,
    AssetsModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaExceptionFilter]
})
export class AppModule {}
