-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Non-Tech',
ADD COLUMN     "companyAddress" TEXT,
ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "companyPhone" TEXT,
ADD COLUMN     "logoUrl" TEXT;
