import { Module, forwardRef } from "@nestjs/common";

import { PrismaModule } from "@/prisma/prisma.module";

import { MediaSyncModule } from "@/media-sync/media-sync.module";
import { RecalculatePersonalScoresQueueService } from "@/settings/recalculate-personal-scores.queue";
import { SettingsController } from "@/settings/settings.controller";
import { SettingsService } from "@/settings/settings.service";

@Module({
  imports: [PrismaModule, forwardRef(() => MediaSyncModule)],
  controllers: [SettingsController],
  providers: [SettingsService, RecalculatePersonalScoresQueueService],
  exports: [SettingsService]
})
export class SettingsModule {}
