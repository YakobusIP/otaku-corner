import type {
  AuditLogListResponse,
  AuditLogQuery
} from "@/types/audit-log.type";
import type { ServiceResult } from "@/types/general.type";

import interceptedAxios from "@/lib/axios";
import { err, ok } from "@/lib/service-result";

const BASE_URL = "/api/audit-logs";

export const auditLogService = {
  async list(
    query: AuditLogQuery = {}
  ): Promise<ServiceResult<AuditLogListResponse>> {
    try {
      const response = await interceptedAxios.get<AuditLogListResponse>(
        BASE_URL,
        { params: query }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  }
};
