import { Prisma, QueueStatus } from "@prisma/client";
import { prisma } from "../prisma";

export class QueueLogger {
  static logJobStart = async (
    jobId: string,
    queueName: string,
    data: Prisma.JsonNullValueInput | Prisma.InputJsonValue
  ) => {
    await prisma.queueLog.create({
      data: {
        jobId,
        queueName,
        status: QueueStatus.QUEUED,
        data
      }
    });
  };

  static updateJobStatus = async (
    jobId: string,
    status: QueueStatus,
    result?: Prisma.InputJsonValue,
    error?: string
  ) => {
    await prisma.queueLog.update({
      where: { jobId: jobId },
      data: {
        status,
        completedAt: new Date(),
        result,
        error
      }
    });
  };
}
