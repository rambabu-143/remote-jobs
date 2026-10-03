-- Remembers which expiry reminder was last sent, so the daily job never emails twice.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "reminderSent" TEXT;
