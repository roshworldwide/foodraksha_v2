-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateIndex
CREATE INDEX "Application_applicationNo_trgm_idx" ON "Application" USING GIN ("applicationNo" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Customer_businessName_trgm_idx" ON "Customer" USING GIN ("businessName" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- CreateIndex
CREATE INDEX "User_name_trgm_idx" ON "User" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "User_mobile_trgm_idx" ON "User" USING GIN ("mobile" gin_trgm_ops);
