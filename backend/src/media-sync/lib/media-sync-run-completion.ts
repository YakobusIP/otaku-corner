import { MediaSyncRunStatus, Prisma } from "@prisma/client";

type RunCompletionClient = Pick<
  Prisma.TransactionClient,
  "mediaSyncRun" | "mediaSyncItem"
>;

export const finalizeMediaSyncRunIfComplete = async (
  client: RunCompletionClient,
  syncRunId: string
): Promise<boolean> => {
  const run = await client.mediaSyncRun.findUnique({
    where: { id: syncRunId },
    select: {
      status: true,
      expectedJobCount: true
    }
  });

  if (
    !run ||
    run.status !== MediaSyncRunStatus.RUNNING ||
    run.expectedJobCount === null ||
    run.expectedJobCount <= 0
  ) {
    return false;
  }

  const terminalItemCount = await client.mediaSyncItem.count({
    where: { syncRunId }
  });

  if (terminalItemCount < run.expectedJobCount) {
    return false;
  }

  await client.mediaSyncRun.update({
    where: { id: syncRunId },
    data: {
      status: MediaSyncRunStatus.COMPLETED,
      finishedAt: new Date()
    }
  });

  return true;
};
