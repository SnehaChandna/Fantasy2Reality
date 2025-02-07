/*
  Warnings:

  - You are about to drop the `DisLikedEm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LikedEm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DisLikedEm" DROP CONSTRAINT "DisLikedEm_userId_fkey";

-- DropForeignKey
ALTER TABLE "LikedEm" DROP CONSTRAINT "LikedEm_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dislikedTours" INTEGER[],
ADD COLUMN     "dislikedem" DOUBLE PRECISION[],
ADD COLUMN     "likedTours" INTEGER[],
ADD COLUMN     "likedem" DOUBLE PRECISION[];

-- DropTable
DROP TABLE "DisLikedEm";

-- DropTable
DROP TABLE "LikedEm";
