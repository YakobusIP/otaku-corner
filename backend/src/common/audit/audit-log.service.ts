import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { AuditAction, AuditSource, Prisma } from "@prisma/client";

export type RecordAuditLogInput = {
  action: AuditAction;
  source: AuditSource;
  entityType: string;
  entityId: string | number;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  actorUserId?: number | null;
  syncRunId?: string | null;
  tx?: Prisma.TransactionClient;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditLogInput): Promise<void> {
    const client = input.tx ?? this.prisma;
    const before =
      input.before === undefined || input.before === null
        ? Prisma.JsonNull
        : (input.before as Prisma.InputJsonValue);
    const after =
      input.after === undefined || input.after === null
        ? Prisma.JsonNull
        : (input.after as Prisma.InputJsonValue);

    await client.auditLog.create({
      data: {
        action: input.action,
        source: input.source,
        entityType: input.entityType,
        entityId: String(input.entityId),
        actorUserId: input.actorUserId ?? null,
        syncRunId: input.syncRunId ?? null,
        before,
        after
      }
    });
  }
}
