import { Module } from "@nestjs/common";

import { StatisticDashboardService } from "@/statistic/statistic-dashboard.service";
import { StatisticLibraryService } from "@/statistic/statistic-library.service";
import { StatisticMediaConsumptionService } from "@/statistic/statistic-media-consumption.service";
import { StatisticOverviewService } from "@/statistic/statistic-overview.service";
import { StatisticTasteProfileService } from "@/statistic/statistic-taste-profile.service";
import { StatisticTopRatedService } from "@/statistic/statistic-top-rated.service";
import { StatisticController } from "@/statistic/statistic.controller";
import { StatisticService } from "@/statistic/statistic.service";

@Module({
  controllers: [StatisticController],
  providers: [
    StatisticService,
    StatisticMediaConsumptionService,
    StatisticOverviewService,
    StatisticDashboardService,
    StatisticTopRatedService,
    StatisticLibraryService,
    StatisticTasteProfileService
  ]
})
export class StatisticModule {}
