import { Get, Query } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { AuditLogQueryService } from "@/common/audit/audit-log-query.service";
import { AuditLogListResponseDto, AuditLogQueryDto } from "@/common/audit/dto";
import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";

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
