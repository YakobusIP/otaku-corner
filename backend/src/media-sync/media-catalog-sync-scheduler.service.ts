import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";

import { PrismaService } from "@/prisma/prisma.service";

import { MediaSyncOrchestratorService } from "@/media-sync/media-sync-orchestrator.service";
import {
  DEFAULT_MEDIA_CATALOG_SYNC_SETTING,
  MEDIA_CATALOG_SYNC_SETTING_KEY,
  parseMediaCatalogSyncSetting
} from "@/settings/media-catalog-sync-setting";

import { MediaSyncRunType } from "@prisma/client";

const JOB_NAME = "media-catalog-sync";

@Injectable()
export class MediaCatalogSyncSchedulerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MediaCatalogSyncSchedulerService.name);
  private intervalRef: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly orchestrator: MediaSyncOrchestratorService
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDefaultSetting();
    await this.rescheduleFromDatabase();
  }

  private async ensureDefaultSetting(): Promise<void> {
    const existing = await this.prisma.appSetting.findUnique({
      where: { key: MEDIA_CATALOG_SYNC_SETTING_KEY }
    });
    if (existing) {
      return;
    }

    await this.prisma.appSetting.create({
      data: {
        key: MEDIA_CATALOG_SYNC_SETTING_KEY,
        value: DEFAULT_MEDIA_CATALOG_SYNC_SETTING
      }
    });
  }

  onModuleDestroy(): void {
    this.clearScheduledJob();
  }

  async rescheduleFromDatabase(): Promise<void> {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: MEDIA_CATALOG_SYNC_SETTING_KEY }
    });

    const parsed = setting
      ? parseMediaCatalogSyncSetting(setting.value)
      : DEFAULT_MEDIA_CATALOG_SYNC_SETTING;

    this.clearScheduledJob();

    if (!parsed.enabled) {
      return;
    }

    const intervalMs = parsed.intervalDays * 24 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      void this.runScheduledSync();
    }, intervalMs);

    this.intervalRef = interval;
    this.schedulerRegistry.addInterval(JOB_NAME, interval);
    this.logger.log(
      `Registered media catalog sync every ${parsed.intervalDays} day(s)`
    );
  }

  private clearScheduledJob(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }

    try {
      this.schedulerRegistry.deleteInterval(JOB_NAME);
    } catch {
      // Interval may not exist yet.
    }
  }

  private async runScheduledSync(): Promise<void> {
    try {
      const runId = await this.orchestrator.startRun(
        MediaSyncRunType.SCHEDULED
      );
      this.logger.log(`Started scheduled media catalog sync run ${runId}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown scheduler error";
      this.logger.error(`Scheduled media catalog sync failed: ${message}`);
    }
  }
}
