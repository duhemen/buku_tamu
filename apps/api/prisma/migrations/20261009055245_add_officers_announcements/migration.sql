-- CreateEnum
CREATE TYPE "OfficerStatusType" AS ENUM ('AVAILABLE', 'BUSY', 'ABSENT', 'OFFLINE');

-- CreateTable
CREATE TABLE "officers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "unit" TEXT,
    "room" TEXT,
    "phone" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "officers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officer_daily_statuses" (
    "id" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "OfficerStatusType" NOT NULL,
    "note" TEXT,
    "returnAt" TEXT,
    "confirmedBy" TEXT,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "officer_daily_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "referenceNo" TEXT,
    "location" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "startTime" TEXT,
    "endTime" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "officers_active_order_idx" ON "officers"("active", "order");

-- CreateIndex
CREATE INDEX "officer_daily_statuses_date_idx" ON "officer_daily_statuses"("date");

-- CreateIndex
CREATE UNIQUE INDEX "officer_daily_statuses_officerId_date_key" ON "officer_daily_statuses"("officerId", "date");

-- CreateIndex
CREATE INDEX "announcements_isActive_startDate_endDate_idx" ON "announcements"("isActive", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "announcements_priority_idx" ON "announcements"("priority");

-- AddForeignKey
ALTER TABLE "officer_daily_statuses" ADD CONSTRAINT "officer_daily_statuses_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "officers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
