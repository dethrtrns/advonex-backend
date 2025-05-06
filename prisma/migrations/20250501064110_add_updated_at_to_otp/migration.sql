/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Otp_phoneNumber_key" ON "Otp"("phoneNumber");
