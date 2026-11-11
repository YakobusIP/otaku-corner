import { Global, Module } from "@nestjs/common";

import { AuditLogService } from "@/common/audit/audit-log.service";

import { AuditLogQueryService } from "@/audit-log/audit-log-query.service";
import { AuditLogController } from "@/audit-log/audit-log.controller";

@Global()
@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogQueryService],
  exports: [AuditLogService, AuditLogQueryService]
})
export class AuditLogModule {}
