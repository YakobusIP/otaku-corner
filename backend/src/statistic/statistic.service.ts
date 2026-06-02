import { Injectable } from "@nestjs/common";

import { StatisticsView } from "@/statistic/enums/statistics-view.enum";
import { StatisticDashboardService } from "@/statistic/statistic-dashboard.service";
import { StatisticLibraryService } from "@/statistic/statistic-library.service";
import { StatisticMediaConsumptionService } from "@/statistic/statistic-media-consumption.service";
import { StatisticOverviewService } from "@/statistic/statistic-overview.service";
import { StatisticTasteProfileService } from "@/statistic/statistic-taste-profile.service";
import { StatisticTopRatedService } from "@/statistic/statistic-top-rated.service";

@Injectable()
export class StatisticService {
  constructor(
    private readonly mediaConsumption: StatisticMediaConsumptionService,
    private readonly overview: StatisticOverviewService,
    private readonly dashboard: StatisticDashboardService,
    private readonly topRated: StatisticTopRatedService,
    private readonly library: StatisticLibraryService,
    private readonly tasteProfile: StatisticTasteProfileService
  ) {}

  getYearRange() {
    return this.mediaConsumption.getYearRange();
  }

  getMediaConsumption(view?: StatisticsView, year?: number) {
    return this.mediaConsumption.getMediaConsumption(view, year);
  }

  getAllTimeStatistics() {
    return this.overview.getAllTimeStatistics();
  }

  getDashboardKpis(year: number) {
    return this.dashboard.getDashboardKpis(year);
  }

  getDashboardKpisAllTime() {
    return this.dashboard.getDashboardKpisAllTime();
  }

  getTopRatedThisYear(year: number) {
    return this.topRated.getTopRatedThisYear(year);
  }

  getTopRatedAllTime() {
    return this.topRated.getTopRatedAllTime();
  }

  getLibraryHealth() {
    return this.library.getLibraryHealth();
  }

  getRecentReviews(limit: number) {
    return this.library.getRecentReviews(limit);
  }

  getTasteProfile(limit: number) {
    return this.tasteProfile.getTasteProfile(limit);
  }

  getTopMediaAndYearlyCount(year?: number) {
    return this.overview.getTopMediaAndYearlyCount(year);
  }
}
