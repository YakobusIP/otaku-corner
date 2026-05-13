import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";

import { StorageModule } from "@/storage/storage.module";
import { UploadController } from "@/upload/upload.controller";
import { UploadService } from "@/upload/upload.service";

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        limits: { fileSize: config.getOrThrow<number>("MAX_FILE_SIZE") }
      })
    }),
    StorageModule
  ],
  controllers: [UploadController],
  providers: [UploadService]
})
export class UploadModule {}
