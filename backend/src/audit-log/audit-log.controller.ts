import { Get, Query } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";

import { AuditLogQueryService } from "@/audit-log/audit-log-query.service";
import { AuditLogListResponseDto, AuditLogQueryDto } from "@/audit-log/dto";

@AuthenticatedApiController({
  tag: "Audit Logs",
  path: "audit-logs"
})
export class AuditLogController {
  constructor(private readonly auditLogQueryService: AuditLogQueryService) {}

  @Get()
  @ApiOkResponse({ type: AuditLogListResponseDto })
  findMany(@Query() query: AuditLogQueryDto): Promise<AuditLogListResponseDto> {
    return this.auditLogQueryService.findMany(query);
  }
}
