-- Every table in `public` is reachable through Supabase's PostgREST API
-- (using the public NEXT_PUBLIC_SUPABASE_ANON_KEY) unless RLS is enabled.
-- This app never queries these tables via the Supabase client (`.from(...)`)
-- — all reads/writes go through Prisma over DATABASE_URL, connected as the
-- project's `postgres` role, which is the tables' owner and so bypasses RLS
-- automatically. No policies are added: the app needs none, and the goal
-- here is simply to stop anon/authenticated REST access to raw rows
-- (emails, resumes, application answers, payment amounts).
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobQuestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApplicationAnswer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
