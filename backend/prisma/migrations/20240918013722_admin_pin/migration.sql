-- CreateTable
CREATE TABLE "AdminPin" (
    "id" SERIAL NOT NULL,
    "pin1" TEXT NOT NULL,
    "pin2" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPin_pkey" PRIMARY KEY ("id")
);
