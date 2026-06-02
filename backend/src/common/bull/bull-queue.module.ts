import { Global, Module } from "@nestjs/common";

import { BullQueueService } from "@/common/bull/bull-queue.service";

@Global()
@Module({
  providers: [BullQueueService],
  exports: [BullQueueService]
})
export class BullQueueModule {}
