import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PrismaModule } from "@/prisma/prisma.module";

import { AuthModule } from "@/auth/auth.module";

import { AnimeModule } from "@/anime/anime.module";
import { AppController } from "@/app.controller";
import { AppService } from "@/app.service";
import { AuthorsModule } from "@/author/authors.module";
import { GenresModule } from "@/genre/genres.module";
import { LightNovelModule } from "@/light-novel/light-novel.module";
import { MangaModule } from "@/manga/manga.module";
import { StatisticModule } from "@/statistic/statistic.module";
import { StudiosModule } from "@/studio/studios.module";
import { ThemesModule } from "@/theme/themes.module";
import { UploadModule } from "@/upload/upload.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AuthModule,
    AuthorsModule,
    GenresModule,
    StudiosModule,
    ThemesModule,
    AnimeModule,
    MangaModule,
    LightNovelModule,
    StatisticModule,
    UploadModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
