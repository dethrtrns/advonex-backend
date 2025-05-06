/*
  Warnings:

  - You are about to drop the column `registrationPending` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "registrationPending" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "LawyerProfile" ADD COLUMN     "registrationPending" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "registrationPending";
