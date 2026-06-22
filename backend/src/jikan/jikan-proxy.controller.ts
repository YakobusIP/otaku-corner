import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { Public } from "@/common/decorators/public.decorator";

import { JikanProxyService } from "@/jikan/jikan-proxy.service";

@Public()
@ApiTags("Jikan")
@Controller("jikan")
export class JikanProxyController {
  constructor(private readonly jikanProxyService: JikanProxyService) {}

  @Get("*path")
  @ApiOperation({ summary: "Proxy read-only Jikan API requests" })
  proxy(
    @Param("path") path: string,
    @Query() query: Record<string, unknown>
  ): Promise<unknown> {
    return this.jikanProxyService.forwardGet(`/${path}`, query);
  }
}
