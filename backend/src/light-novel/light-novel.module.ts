import { Module } from "@nestjs/common";

import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";

import { AuthorsModule } from "@/author/authors.module";
import { GenresModule } from "@/genre/genres.module";
import { FetchLightNovelRanobeDbQueueService } from "@/light-novel/fetch-light-novel-ranobedb.queue";
import { LightNovelQueryBuilder } from "@/light-novel/light-novel-query-builder";
import { LightNovelController } from "@/light-novel/light-novel.controller";
import { LightNovelService } from "@/light-novel/light-novel.service";
import { ThemesModule } from "@/theme/themes.module";

@Module({
  imports: [AuthorsModule, GenresModule, ThemesModule],
  controllers: [LightNovelController],
  providers: [
    LightNovelService,
    FetchLightNovelRanobeDbQueueService,
    { provide: CrudQueryBuilder, useClass: LightNovelQueryBuilder }
  ],
  exports: [LightNovelService]
})
export class LightNovelModule {}
