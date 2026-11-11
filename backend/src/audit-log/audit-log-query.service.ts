import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { AuditLogListResponseDto, AuditLogQueryDto } from "@/audit-log/dto";

import { AuditLog, Prisma } from "@prisma/client";

type AuditLogCursorPayload = {
  createdAt: string;
  id: string;
};

@Injectable()
export class AuditLogQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: AuditLogQueryDto): Promise<AuditLogListResponseDto> {
    const limit = query.limit ?? 25;
    const cursor = query.cursor ? this.decodeCursor(query.cursor) : null;

    const where: Prisma.AuditLogWhereInput = {
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              {
                createdAt: new Date(cursor.createdAt),
                id: { lt: cursor.id }
              }
            ]
          }
        : {})
    };

    const rows = await this.prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items.at(-1);

    return {
      items: items.map((row) => this.toDto(row)),
      nextCursor:
        hasMore && last
          ? this.encodeCursor({
              createdAt: last.createdAt.toISOString(),
              id: last.id
            })
          : null
    };
  }

  private toDto(row: AuditLog): AuditLogListResponseDto["items"][number] {
    return {
      id: row.id,
      createdAt: row.createdAt,
      action: row.action,
      source: row.source,
      entityType: row.entityType,
      entityId: row.entityId,
      actorUserId: row.actorUserId,
      syncRunId: row.syncRunId,
      before: row.before as Record<string, unknown> | null,
      after: row.after as Record<string, unknown> | null
    };
  }

  private encodeCursor(payload: AuditLogCursorPayload): string {
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  }

  private decodeCursor(cursor: string): AuditLogCursorPayload {
    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, "base64url").toString("utf8")
      ) as AuditLogCursorPayload;

      if (
        typeof parsed.createdAt !== "string" ||
        typeof parsed.id !== "string" ||
        parsed.id.length === 0
      ) {
        throw new Error("Invalid cursor shape");
      }

      return parsed;
    } catch {
      throw new BadRequestException("Invalid audit log cursor");
    }
  }
}
