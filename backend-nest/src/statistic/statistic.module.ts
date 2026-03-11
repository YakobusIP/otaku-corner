import { Module } from "@nestjs/common";
import { StatisticController } from "@/statistic/statistic.controller";
import { StatisticService } from "@/statistic/statistic.service";

@Module({
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
