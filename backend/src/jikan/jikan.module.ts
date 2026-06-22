import { Module } from "@nestjs/common";

import { JikanProxyController } from "@/jikan/jikan-proxy.controller";
import { JikanProxyService } from "@/jikan/jikan-proxy.service";

@Module({
  controllers: [JikanProxyController],
  providers: [JikanProxyService],
  exports: [JikanProxyService]
})
export class JikanModule {}
