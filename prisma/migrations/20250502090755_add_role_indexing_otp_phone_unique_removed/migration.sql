-- DropIndex
DROP INDEX "Otp_phoneNumber_key";

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");
