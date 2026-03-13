import { Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";
import { StatisticService } from "@/statistic/statistic.service";
import { StatisticsView } from "@/statistic/enums/statistics-view.enum";
import {
  MediaConsumptionQueryDto,
  MediaProgressQueryDto,
} from "@/statistic/dto";

@AuthenticatedApiController({ tag: "Statistic", path: "statistic" })
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get("year-range")
  @ApiOperation({ summary: "Get available year range for statistics" })
  @ApiResponse({ status: 200, description: "Year range retrieved" })
  getYearRange() {
    return this.statisticService.getYearRange();
  }

  @Get("media-consumption")
  @ApiOperation({ summary: "Get media consumption statistics" })
  @ApiResponse({ status: 200, description: "Media consumption data retrieved" })
  getMediaConsumption(@Query() query: MediaConsumptionQueryDto) {
    return this.statisticService.getMediaConsumption(
      query.view as StatisticsView,
      query.year,
    );
  }

  @Get("media-progress")
  @ApiOperation({ summary: "Get media progress statistics" })
  @ApiResponse({ status: 200, description: "Media progress data retrieved" })
  getMediaProgress(@Query() query: MediaProgressQueryDto) {
    return this.statisticService.getMediaProgress(query.media);
  }

  @Get("genre-consumption")
  @ApiOperation({ summary: "Get top genre consumption statistics" })
  @ApiResponse({ status: 200, description: "Genre consumption data retrieved" })
  getGenreConsumption() {
    return this.statisticService.getGenreConsumption();
  }

  @Get("studio-consumption")
  @ApiOperation({ summary: "Get top studio consumption statistics" })
  @ApiResponse({
    status: 200,
    description: "Studio consumption data retrieved",
  })
  getStudioConsumption() {
    return this.statisticService.getStudioConsumption();
  }

  @Get("theme-consumption")
  @ApiOperation({ summary: "Get top theme consumption statistics" })
  @ApiResponse({ status: 200, description: "Theme consumption data retrieved" })
  getThemeConsumption() {
    return this.statisticService.getThemeConsumption();
  }

  @Get("author-consumption")
  @ApiOperation({ summary: "Get top author consumption statistics" })
  @ApiResponse({
    status: 200,
    description: "Author consumption data retrieved",
  })
  getAuthorConsumption() {
    return this.statisticService.getAuthorConsumption();
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
    summary: "Get top-rated media and yearly consumption count",
  })
  @ApiResponse({
    status: 200,
    description: "Top media and yearly count retrieved",
  })
  getTopMediaAndYearlyCount() {
    return this.statisticService.getTopMediaAndYearlyCount();
  }
}
