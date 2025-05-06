/*
  Warnings:

  - You are about to drop the column `email` on the `ClientProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ClientProfile_email_key";

-- AlterTable
ALTER TABLE "ClientProfile" DROP COLUMN "email";
