import { Global, Module } from "@nestjs/common";

import { AuditLogQueryService } from "@/common/audit/audit-log-query.service";
import { AuditLogController } from "@/common/audit/audit-log.controller";
import { AuditLogService } from "@/common/audit/audit-log.service";

@Global()
@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogQueryService],
  exports: [AuditLogService, AuditLogQueryService]
})
export class AuditLogModule {}
