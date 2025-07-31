/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Token` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Token_expiresAt_ownerId_idx";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "expiresAt";
