/*
  Warnings:

  - The values [INDEFINIDO,TERMINO_FIJO,OBRA_LABOR] on the enum `ContractType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userId` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `JobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ResumeVariant` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `profileId` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `JobApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `ResumeVariant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "ContractType_new" AS ENUM ('UNDEFINED', 'FIXED_TERM', 'PROJECT_BASED', 'CONTRACTOR', 'OTHER');
ALTER TABLE "JobApplication" ALTER COLUMN "contractType" TYPE "ContractType_new" USING ("contractType"::text::"ContractType_new");
ALTER TYPE "ContractType" RENAME TO "ContractType_old";
ALTER TYPE "ContractType_new" RENAME TO "ContractType";
DROP TYPE "public"."ContractType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_userId_fkey";

-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_userId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeVariant" DROP CONSTRAINT "ResumeVariant_userId_fkey";

-- DropIndex
DROP INDEX "Interview_userId_idx";

-- DropIndex
DROP INDEX "JobApplication_userId_idx";

-- DropIndex
DROP INDEX "Reminder_userId_idx";

-- DropIndex
DROP INDEX "Resume_userId_idx";

-- DropIndex
DROP INDEX "ResumeVariant_userId_idx";

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ResumeVariant" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "document" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "timezone" TEXT,
    "language" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE INDEX "Profile_email_idx" ON "Profile"("email");

-- CreateIndex
CREATE INDEX "Interview_profileId_idx" ON "Interview"("profileId");

-- CreateIndex
CREATE INDEX "JobApplication_profileId_idx" ON "JobApplication"("profileId");

-- CreateIndex
CREATE INDEX "Reminder_profileId_idx" ON "Reminder"("profileId");

-- CreateIndex
CREATE INDEX "Resume_profileId_idx" ON "Resume"("profileId");

-- CreateIndex
CREATE INDEX "ResumeVariant_profileId_idx" ON "ResumeVariant"("profileId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeVariant" ADD CONSTRAINT "ResumeVariant_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
