-- CreateEnum
CREATE TYPE "HandoverType" AS ENUM ('SURAT', 'JAMINAN_TENDER', 'PAKET', 'DOKUMEN', 'LAINNYA');

-- CreateEnum
CREATE TYPE "HandoverStatus" AS ENUM ('RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'RETURNED');

-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "faceHash" TEXT,
ADD COLUMN     "facePhoto" TEXT;

-- CreateTable
CREATE TABLE "handovers" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "HandoverType" NOT NULL,
    "referenceNo" TEXT,
    "description" TEXT NOT NULL,
    "recipient" TEXT,
    "status" "HandoverStatus" NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handovers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "handovers_code_key" ON "handovers"("code");

-- CreateIndex
CREATE INDEX "handovers_visitId_idx" ON "handovers"("visitId");

-- CreateIndex
CREATE INDEX "handovers_code_idx" ON "handovers"("code");

-- CreateIndex
CREATE INDEX "guests_faceHash_idx" ON "guests"("faceHash");

-- AddForeignKey
ALTER TABLE "handovers" ADD CONSTRAINT "handovers_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
