import { MediaSyncRunStatus } from "@prisma/client";

import { finalizeMediaSyncRunIfComplete } from "./media-sync-run-completion";

describe("finalizeMediaSyncRunIfComplete", () => {
  it("completes a run when terminal item count reaches expected jobs", async () => {
    const mediaSyncRun = {
      findUnique: jest.fn().mockResolvedValue({
        status: MediaSyncRunStatus.RUNNING,
        expectedJobCount: 2
      }),
      update: jest.fn().mockResolvedValue({})
    };
    const mediaSyncItem = {
      count: jest.fn().mockResolvedValue(2)
    };

    const completed = await finalizeMediaSyncRunIfComplete(
      { mediaSyncRun, mediaSyncItem } as never,
      "run-1"
    );

    expect(completed).toBe(true);
    const update = mediaSyncRun.update as jest.Mock<
      Promise<unknown>,
      [
        {
          where: { id: string };
          data: { status: MediaSyncRunStatus; finishedAt: Date };
        }
      ]
    >;
    expect(update).toHaveBeenCalledTimes(1);
    const updateArgs = update.mock.calls[0]?.[0];
    expect(updateArgs?.where).toEqual({ id: "run-1" });
    expect(updateArgs?.data.status).toBe(MediaSyncRunStatus.COMPLETED);
    expect(updateArgs?.data.finishedAt).toBeInstanceOf(Date);
  });

  it("does not complete while terminal items are still missing", async () => {
    const mediaSyncRun = {
      findUnique: jest.fn().mockResolvedValue({
        status: MediaSyncRunStatus.RUNNING,
        expectedJobCount: 3
      }),
      update: jest.fn()
    };
    const mediaSyncItem = {
      count: jest.fn().mockResolvedValue(1)
    };

    const completed = await finalizeMediaSyncRunIfComplete(
      { mediaSyncRun, mediaSyncItem } as never,
      "run-1"
    );

    expect(completed).toBe(false);
    expect(mediaSyncRun.update).not.toHaveBeenCalled();
  });

  it("does not complete before expectedJobCount is persisted", async () => {
    const mediaSyncRun = {
      findUnique: jest.fn().mockResolvedValue({
        status: MediaSyncRunStatus.RUNNING,
        expectedJobCount: null
      }),
      update: jest.fn()
    };
    const mediaSyncItem = {
      count: jest.fn().mockResolvedValue(1)
    };

    const completed = await finalizeMediaSyncRunIfComplete(
      { mediaSyncRun, mediaSyncItem } as never,
      "run-1"
    );

    expect(completed).toBe(false);
    expect(mediaSyncRun.update).not.toHaveBeenCalled();
  });
});
