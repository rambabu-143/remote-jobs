-- CreateIndex
CREATE INDEX "Job_isActive_createdAt_idx" ON "Job"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Job_category_idx" ON "Job"("category");

-- CreateIndex
CREATE INDEX "Job_location_idx" ON "Job"("location");

-- CreateIndex
CREATE INDEX "Job_remoteType_idx" ON "Job"("remoteType");

-- CreateIndex
CREATE INDEX "Job_employmentType_idx" ON "Job"("employmentType");
