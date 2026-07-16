import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "@/common/decorators/public.decorator";

import { TenraiProxyService } from "@/tenrai/tenrai-proxy.service";

@Public()
@ApiTags("Tenrai")
@Controller("tenrai")
export class TenraiProxyController {
  constructor(private readonly tenraiProxyService: TenraiProxyService) {}

  @Get("*path")
  @ApiOperation({ summary: "Proxy read-only Tenrai API requests" })
  proxy(
    @Param("path") path: string,
    @Query() query: Record<string, unknown>
  ): Promise<unknown> {
    return this.tenraiProxyService.forwardGet(`/${path}`, query);
  }
}
