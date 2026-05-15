import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { FILE_STORAGE } from "@/storage/file-storage.interface";
import { LocalFileStorageService } from "@/storage/local-file-storage.service";
import { R2FileStorageService } from "@/storage/r2-file-storage.service";

@Module({
  imports: [ConfigModule],
  providers: [
    LocalFileStorageService,
    R2FileStorageService,
    {
      provide: FILE_STORAGE,
      useFactory: (
        config: ConfigService,
        localStorage: LocalFileStorageService,
        r2Storage: R2FileStorageService
      ) =>
        config.get<string>("STORAGE_DRIVER") === "r2"
          ? r2Storage
          : localStorage,
      inject: [ConfigService, LocalFileStorageService, R2FileStorageService]
    }
  ],
  exports: [FILE_STORAGE]
})
export class StorageModule {}
