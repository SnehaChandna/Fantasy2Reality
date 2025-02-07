/*
  Warnings:

  - You are about to drop the column `trekId` on the `DisLikedEm` table. All the data in the column will be lost.
  - You are about to drop the column `trekId` on the `LikedEm` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "DisLikedEm_userId_trekId_idx";

-- DropIndex
DROP INDEX "LikedEm_userId_trekId_idx";

-- AlterTable
ALTER TABLE "DisLikedEm" DROP COLUMN "trekId";

-- AlterTable
ALTER TABLE "LikedEm" DROP COLUMN "trekId";

-- CreateIndex
CREATE INDEX "DisLikedEm_userId_idx" ON "DisLikedEm"("userId");

-- CreateIndex
CREATE INDEX "LikedEm_userId_idx" ON "LikedEm"("userId");
