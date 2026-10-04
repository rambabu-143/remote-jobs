-- Jobs a seeker has saved to apply to later. Cascades when the user or the job is deleted.
-- RLS on with no policies, like every other table, so the public Data API can't touch it.
CREATE TABLE IF NOT EXISTS "SavedJob" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SavedJob_userId_jobId_key" ON "SavedJob"("userId", "jobId");
CREATE INDEX IF NOT EXISTS "SavedJob_userId_createdAt_idx" ON "SavedJob"("userId", "createdAt");
ALTER TABLE "SavedJob" ENABLE ROW LEVEL SECURITY;
