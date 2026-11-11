import { BadRequestException } from "@nestjs/common";

import { AuditAction, type AuditLog, AuditSource } from "@prisma/client";

import { AuditLogQueryService } from "./audit-log-query.service";

const makeRow = (overrides: Partial<AuditLog> = {}): AuditLog => ({
  id: "audit-log-1",
  createdAt: new Date("2024-06-01T12:00:00.000Z"),
  action: AuditAction.UPDATE,
  source: AuditSource.ADMIN,
  entityType: "anime",
  entityId: "42",
  actorUserId: 1,
  syncRunId: null,
  before: { title: "Before" },
  after: { title: "After" },
  ...overrides
});

const createService = (findMany: jest.Mock) =>
  new AuditLogQueryService({ auditLog: { findMany } } as never);

describe("AuditLogQueryService", () => {
  it("uses a default page size of 25 when limit is omitted", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = createService(findMany);

    await service.findMany({});

    expect(findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 26
    });
  });

  it("applies entityType, entityId, action, and source filters in the Prisma where clause", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = createService(findMany);

    await service.findMany({
      entityType: "manga",
      entityId: "7",
      action: AuditAction.DELETE,
      source: AuditSource.SYNC,
      limit: 10
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        entityType: "manga",
        entityId: "7",
        action: AuditAction.DELETE,
        source: AuditSource.SYNC
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 11
    });
  });

  it("returns nextCursor when more rows exist than the requested limit", async () => {
    const rows = [
      makeRow({ id: "a", createdAt: new Date("2024-06-02T00:00:00.000Z") }),
      makeRow({ id: "b", createdAt: new Date("2024-06-01T12:00:00.000Z") }),
      makeRow({ id: "c", createdAt: new Date("2024-05-31T00:00:00.000Z") })
    ];
    const findMany = jest.fn().mockResolvedValue(rows);
    const service = createService(findMany);

    const result = await service.findMany({ limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.id).toBe("a");
    expect(result.items[1]?.id).toBe("b");
    expect(result.nextCursor).toEqual(
      Buffer.from(
        JSON.stringify({
          createdAt: "2024-06-01T12:00:00.000Z",
          id: "b"
        }),
        "utf8"
      ).toString("base64url")
    );
  });

  it("returns null nextCursor when the result set does not exceed the limit", async () => {
    const findMany = jest.fn().mockResolvedValue([makeRow({ id: "only-one" })]);
    const service = createService(findMany);

    const result = await service.findMany({ limit: 5 });

    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });

  it("decodes nextCursor on a follow-up request for cursor pagination", async () => {
    const firstPage = [
      makeRow({ id: "row-2", createdAt: new Date("2024-06-02T00:00:00.000Z") }),
      makeRow({ id: "row-1", createdAt: new Date("2024-06-01T00:00:00.000Z") }),
      makeRow({ id: "row-0", createdAt: new Date("2024-05-31T00:00:00.000Z") })
    ];
    const findMany = jest
      .fn()
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce([]);
    const service = createService(findMany);

    const first = await service.findMany({ limit: 2 });
    expect(first.nextCursor).not.toBeNull();

    await service.findMany({ limit: 2, cursor: first.nextCursor ?? undefined });

    expect(findMany).toHaveBeenLastCalledWith({
      where: {
        OR: [
          { createdAt: { lt: new Date("2024-06-01T00:00:00.000Z") } },
          {
            createdAt: new Date("2024-06-01T00:00:00.000Z"),
            id: { lt: "row-1" }
          }
        ]
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 3
    });
  });

  it("throws BadRequestException when the cursor cannot be decoded", async () => {
    const findMany = jest.fn();
    const service = createService(findMany);

    await expect(
      service.findMany({ cursor: "not-a-valid-cursor" })
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.findMany({ cursor: "not-a-valid-cursor" })
    ).rejects.toThrow("Invalid audit log cursor");
    expect(findMany).not.toHaveBeenCalled();
  });
});
