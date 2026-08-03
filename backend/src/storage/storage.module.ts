import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { R2AnalyticsService } from "@/storage/r2-analytics.service";
import { R2FileStorageService } from "@/storage/r2-file-storage.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [R2FileStorageService, R2AnalyticsService],
  exports: [R2FileStorageService, R2AnalyticsService]
})
export class StorageModule {}
