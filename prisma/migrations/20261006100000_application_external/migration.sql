-- Applications marked as "applied on the company site" have no resume file.
ALTER TABLE "Application" ALTER COLUMN "resumeFileName" DROP NOT NULL;
