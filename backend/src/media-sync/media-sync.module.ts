import { Module, forwardRef } from "@nestjs/common";

import { AnimeModule } from "@/anime/anime.module";
import { ExternalMetadataEnrichmentService } from "@/media-sync/external-metadata-enrichment.service";
import { MediaCatalogBaselineService } from "@/media-sync/media-catalog-baseline.service";
import { MediaCatalogSyncSchedulerService } from "@/media-sync/media-catalog-sync-scheduler.service";
import { MediaCatalogSyncQueueService } from "@/media-sync/media-catalog-sync.queue";
import { MediaCatalogSyncService } from "@/media-sync/media-catalog-sync.service";
import { MediaSyncItemController } from "@/media-sync/media-sync-item.controller";
import { MediaSyncOrchestratorService } from "@/media-sync/media-sync-orchestrator.service";
import { MediaSyncQueryService } from "@/media-sync/media-sync-query.service";
import { MediaSyncResolveService } from "@/media-sync/media-sync-resolve.service";
import { MediaSyncController } from "@/media-sync/media-sync.controller";
import { TenraiModule } from "@/tenrai/tenrai.module";

@Module({
  imports: [forwardRef(() => AnimeModule), TenraiModule],
  controllers: [MediaSyncController, MediaSyncItemController],
  providers: [
    ExternalMetadataEnrichmentService,
    MediaCatalogBaselineService,
    MediaCatalogSyncService,
    MediaCatalogSyncQueueService,
    MediaCatalogSyncSchedulerService,
    MediaSyncOrchestratorService,
    MediaSyncQueryService,
    MediaSyncResolveService
  ],
  exports: [
    MediaSyncOrchestratorService,
    MediaCatalogSyncSchedulerService,
    MediaCatalogSyncService
  ]
})
export class MediaSyncModule {}
