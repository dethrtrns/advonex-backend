-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropIndex
DROP INDEX "ConsultationRequest_status_idx";

-- AlterTable
ALTER TABLE "ConsultationRequest" ADD COLUMN     "response" TEXT,
ADD COLUMN     "responseReason" TEXT,
ADD COLUMN     "responseStatus" "ResponseStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "responseTimestamp" TIMESTAMP(3);
