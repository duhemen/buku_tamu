/*
  Warnings:

  - You are about to drop the column `closeTime` on the `operating_hours` table. All the data in the column will be lost.
  - You are about to drop the column `cutOffTime` on the `operating_hours` table. All the data in the column will be lost.
  - You are about to drop the column `openTime` on the `operating_hours` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "operating_hours" DROP COLUMN "closeTime",
DROP COLUMN "cutOffTime",
DROP COLUMN "openTime";

-- CreateTable
CREATE TABLE "operating_sessions" (
    "id" TEXT NOT NULL,
    "operatingHoursId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "cutOffTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operating_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operating_sessions_operatingHoursId_idx" ON "operating_sessions"("operatingHoursId");

-- CreateIndex
CREATE UNIQUE INDEX "operating_sessions_operatingHoursId_sessionNumber_key" ON "operating_sessions"("operatingHoursId", "sessionNumber");

-- AddForeignKey
ALTER TABLE "operating_sessions" ADD CONSTRAINT "operating_sessions_operatingHoursId_fkey" FOREIGN KEY ("operatingHoursId") REFERENCES "operating_hours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
