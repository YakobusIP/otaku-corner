export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type AuditSource = "ADMIN" | "SYNC" | "CREATE" | "SYSTEM";

export type AuditLogItem = {
  id: string;
  createdAt: string;
  action: AuditAction;
  source: AuditSource;
  entityType: string;
  entityId: string;
  actorUserId: number | null;
  syncRunId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};

export type AuditLogListResponse = {
  items: AuditLogItem[];
  nextCursor: string | null;
};

export type AuditLogQuery = {
  limit?: number;
  cursor?: string;
  entityType?: string;
  entityId?: string;
  action?: AuditAction;
  source?: AuditSource;
};
