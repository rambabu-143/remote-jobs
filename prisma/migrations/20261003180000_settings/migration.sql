-- Site-wide admin settings (key/value). RLS on with no policies, like every other table, so the
-- public Data API can't read or change them; only the server (service connection) can.
CREATE TABLE IF NOT EXISTS "Setting" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);
ALTER TABLE "Setting" ENABLE ROW LEVEL SECURITY;
INSERT INTO "Setting" ("key", "value") VALUES ('employerPlanRequired', 'false') ON CONFLICT ("key") DO NOTHING;
