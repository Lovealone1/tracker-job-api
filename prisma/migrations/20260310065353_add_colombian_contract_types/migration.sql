-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('INDEFINIDO', 'TERMINO_FIJO', 'OBRA_LABOR', 'CONTRACTOR', 'OTHER');

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "contractType" "ContractType";
