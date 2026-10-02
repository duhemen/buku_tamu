/*
  Warnings:

  - You are about to drop the column `faceHash` on the `guests` table. All the data in the column will be lost.
  - You are about to drop the column `facePhoto` on the `guests` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "guests_faceHash_idx";

-- AlterTable
ALTER TABLE "guests" DROP COLUMN "faceHash",
DROP COLUMN "facePhoto";
