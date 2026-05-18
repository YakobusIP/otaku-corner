import { BadRequestException, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";
import { Public } from "@/common/decorators/public.decorator";

import {
  DashboardYearQueryDto,
  MediaConsumptionQueryDto,
  RecentReviewsQueryDto,
  TasteProfileQueryDto
} from "@/statistic/dto";
import { StatisticsView } from "@/statistic/enums/statistics-view.enum";
import { StatisticService } from "@/statistic/statistic.service";

@AuthenticatedApiController({ tag: "Statistic", path: "statistic" })
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get("year-range")
  @ApiOperation({ summary: "Get available year range for statistics" })
  @ApiResponse({ status: 200, description: "Year range retrieved" })
  getYearRange() {
    return this.statisticService.getYearRange();
  }

  @Public()
  @Get("media-consumption")
  @ApiOperation({ summary: "Get media consumption statistics" })
  @ApiResponse({ status: 200, description: "Media consumption data retrieved" })
  getMediaConsumption(@Query() query: MediaConsumptionQueryDto) {
    return this.statisticService.getMediaConsumption(
      query.view as StatisticsView,
      query.year
    );
  }

  @Get("dashboard-kpis")
  @ApiOperation({ summary: "Dashboard headline KPIs with YoY vs prior year" })
  @ApiResponse({ status: 200, description: "Dashboard KPIs retrieved" })
  getDashboardKpis(@Query() query: DashboardYearQueryDto) {
    if (query.allTime) {
      return this.statisticService.getDashboardKpisAllTime();
    }
    if (query.year === undefined || query.year === null) {
      throw new BadRequestException(
        "year is required when allTime is not true"
      );
    }
    return this.statisticService.getDashboardKpis(query.year);
  }

  @Get("top-rated")
  @ApiOperation({
    summary:
      "Highest personal score per media type among items consumed in the calendar year (anime/manga: review consumedAt; light novel: any volume consumedAt)"
  })
  @ApiResponse({ status: 200, description: "Top rated items retrieved" })
  getTopRatedThisYear(@Query() query: DashboardYearQueryDto) {
    if (query.allTime) {
      return this.statisticService.getTopRatedAllTime();
    }
    if (query.year === undefined || query.year === null) {
      throw new BadRequestException(
        "year is required when allTime is not true"
      );
    }
    return this.statisticService.getTopRatedThisYear(query.year);
  }

  @Get("library-health")
  @ApiOperation({
    summary: "Library counts by progress status across all media types"
  })
  @ApiResponse({ status: 200, description: "Library health retrieved" })
  getLibraryHealth() {
    return this.statisticService.getLibraryHealth();
  }

  @Public()
  @Get("recent-reviews")
  @ApiOperation({ summary: "Most recently updated reviews across media types" })
  @ApiResponse({ status: 200, description: "Recent reviews retrieved" })
  getRecentReviews(@Query() query: RecentReviewsQueryDto) {
    return this.statisticService.getRecentReviews(query.limit ?? 10);
  }

  @Public()
  @Get("taste-profile")
  @ApiOperation({
    summary:
      "Top genres, themes, studios, authors; percentage is share of the full library (not only the returned rows)"
  })
  @ApiResponse({ status: 200, description: "Taste profile retrieved" })
  getTasteProfile(@Query() query: TasteProfileQueryDto) {
    return this.statisticService.getTasteProfile(query.limit ?? 10);
  }

  @Public()
  @Get("all-time")
  @ApiOperation({ summary: "Get all-time aggregate statistics" })
  @ApiResponse({ status: 200, description: "All-time statistics retrieved" })
  getAllTimeStatistics() {
    return this.statisticService.getAllTimeStatistics();
  }

  @Public()
  @Get("top-media-and-yearly-count")
  @ApiOperation({
    summary: "Get top-rated media and yearly consumption count"
  })
  @ApiResponse({
    status: 200,
    description: "Top media and yearly count retrieved"
  })
  getTopMediaAndYearlyCount() {
    return this.statisticService.getTopMediaAndYearlyCount();
  }
}
