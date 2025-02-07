/*
  Warnings:

  - You are about to drop the `UserBookmark` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserBookmark" DROP CONSTRAINT "UserBookmark_userId_fkey";

-- DropTable
DROP TABLE "UserBookmark";
