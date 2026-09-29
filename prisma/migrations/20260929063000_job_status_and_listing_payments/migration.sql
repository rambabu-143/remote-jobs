-- JobStatus enum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'CLOSED');

-- Replace Job.isActive with Job.status, backfilling existing rows
ALTER TABLE "Job" ADD COLUMN "status" "JobStatus" NOT NULL DEFAULT 'DRAFT';
UPDATE "Job" SET "status" = CASE WHEN "isActive" THEN 'PUBLISHED' ELSE 'CLOSED' END::"JobStatus";

DROP INDEX IF EXISTS "Job_isActive_createdAt_idx";
ALTER TABLE "Job" DROP COLUMN "isActive";

CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- JobPayment: one-off flat-fee payment per job listing, separate from the
-- seeker apply-access Payment model.
CREATE TABLE "JobPayment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountInPaise" INTEGER NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobPayment_jobId_key" ON "JobPayment"("jobId");
CREATE UNIQUE INDEX "JobPayment_razorpayOrderId_key" ON "JobPayment"("razorpayOrderId");

ALTER TABLE "JobPayment" ADD CONSTRAINT "JobPayment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobPayment" ADD CONSTRAINT "JobPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- This project enables RLS with zero policies on every table (Prisma's own
-- DB role owns the tables and bypasses RLS; this only blocks direct
-- PostgREST/anon-key access). Keep JobPayment consistent with the rest.
ALTER TABLE "JobPayment" ENABLE ROW LEVEL SECURITY;
