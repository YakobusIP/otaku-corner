import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { R2FileStorageService } from "@/storage/r2-file-storage.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [R2FileStorageService],
  exports: [R2FileStorageService]
})
export class StorageModule {}
