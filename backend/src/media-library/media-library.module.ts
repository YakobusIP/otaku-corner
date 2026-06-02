import { Module } from "@nestjs/common";

import { MediaLibraryController } from "@/media-library/media-library.controller";
import { MediaLibraryService } from "@/media-library/media-library.service";

@Module({
  controllers: [MediaLibraryController],
  providers: [MediaLibraryService]
})
export class MediaLibraryModule {}
