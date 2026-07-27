import { Module } from "@nestjs/common";

import { PrismaModule } from "@/prisma/prisma.module";

import { RecalculatePersonalScoresQueueService } from "@/settings/recalculate-personal-scores.queue";
import { SettingsController } from "@/settings/settings.controller";
import { SettingsService } from "@/settings/settings.service";

@Module({
  imports: [PrismaModule],
  controllers: [SettingsController],
  providers: [SettingsService, RecalculatePersonalScoresQueueService],
  exports: [SettingsService]
})
export class SettingsModule {}
