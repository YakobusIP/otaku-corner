import { Module } from "@nestjs/common";

import { TenraiProxyController } from "@/tenrai/tenrai-proxy.controller";
import { TenraiProxyService } from "@/tenrai/tenrai-proxy.service";

@Module({
  controllers: [TenraiProxyController],
  providers: [TenraiProxyService],
  exports: [TenraiProxyService]
})
export class TenraiModule {}
