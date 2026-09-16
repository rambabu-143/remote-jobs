# RemoteJobs

A remote job board: admins post jobs, users browse/search/filter and apply. Built with Next.js 16 (App Router, Server Actions), Prisma + SQLite, and Auth.js v5 (credentials login).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Seeded admin login: `admin@example.com` / `admin1234`.

To reset the database: `rm prisma/dev.db && npx prisma migrate dev && npx prisma db seed`.

## What's here

- Public job board with search + filters (title/company/tag, location type, employment type)
- User signup/login, apply to jobs (resume upload + cover note + any screening questions the admin set), "My applications" dashboard
- Admin panel: post/edit/deactivate/delete jobs, define per-job screening questions, review applicants (resume, cover note, answers), update application status
- Email notifications: admin gets emailed on a new application, applicant gets emailed on a status change (see "Email" below to actually send them)
- Role-based access (`USER` / `ADMIN`) enforced in `proxy.ts` (route-level) and again in each server action (defense in depth)
- Resumes are stored on disk and served through an auth-gated route (`/api/files/resumes/[filename]`) — only the applicant or an admin can fetch a given resume
- Admin-only docs site at `/docs` (built with [Fumadocs](https://fumadocs.dev)) — architecture, data model, auth, admin/applicant guides, email setup, env vars, and deployment notes. See "Docs" in the nav once logged in as an admin.

## Email

Emails just log to the server console until you set `RESEND_API_KEY` in `.env` (see `.env.example`). Get a free key at resend.com, verify a sending domain (or use their `onboarding@resend.dev` test address for local dev), and set `EMAIL_FROM` accordingly.

## Known simplifications (`ponytail:` shortcuts)

- **SQLite, not Postgres.** Zero-setup for local dev. Swap `provider = "sqlite"` → `"postgresql"` in `prisma/schema.prisma` and set `DATABASE_URL` to a real Postgres connection string when deploying — `contains` search also becomes case-insensitive for free via `mode: "insensitive"` at that point.
- **Resumes on local disk**, under `uploads/` (gitignored). Fine for a single instance; move to S3/R2 + presigned URLs before deploying to a serverless/multi-instance host, since local disk won't be shared or persistent there.
- **Editing a job's screening questions after it has applicants** replaces the question set (deletes + recreates), which cascades and deletes any answers tied to removed questions. Fine for an MVP; add versioning if historical answers must survive question edits.

## Ideas to scale this further

- **Search**: swap SQLite `contains` for Postgres full-text search or Algolia/Meilisearch once job volume grows.
- **Payments**: Stripe for paid/featured listings, or a "boost" for extra visibility — common revenue model for job boards.
- **Job alerts**: users save a search filter and get emailed when matching jobs post (cron + email).
- **Company profiles**: a `Company` model instead of a plain string, with a logo, description, and its own jobs listing page.
- **Multi-admin / teams**: today any `ADMIN` can edit any job; add an `ownerId`-scoped permission model if multiple companies each need their own admin.
- **Resume storage**: move from local disk to S3/R2 with presigned uploads.
- **Moderation queue**: jobs go to `PENDING` review before going live, if you open posting to non-admins.
- **Analytics**: view counts per job, application funnel (views → applications → hires) on the admin dashboard.
- **API/RSS**: expose `/api/jobs` (JSON) and an RSS feed so the board can be aggregated elsewhere.
- **Postgres + hosting**: deploy on Vercel with Vercel Postgres/Neon; the codebase needs no structural changes, just the datasource swap above.
