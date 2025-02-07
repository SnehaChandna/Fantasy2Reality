/*
  Warnings:

  - You are about to drop the column `bookmarks` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `disliked_routes` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `liked_routes` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "bookmarks",
DROP COLUMN "disliked_routes",
DROP COLUMN "liked_routes";

-- CreateTable
CREATE TABLE "LikedEm" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "trekId" INTEGER NOT NULL,
    "embedding" DOUBLE PRECISION[],

    CONSTRAINT "LikedEm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisLikedEm" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "trekId" INTEGER NOT NULL,
    "embedding" DOUBLE PRECISION[],

    CONSTRAINT "DisLikedEm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBookmark" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "trekId" INTEGER NOT NULL,

    CONSTRAINT "UserBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trek_comment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "trekId" INTEGER NOT NULL,
    "comment" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trek_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LikedEm_userId_trekId_idx" ON "LikedEm"("userId", "trekId");

-- CreateIndex
CREATE INDEX "DisLikedEm_userId_trekId_idx" ON "DisLikedEm"("userId", "trekId");

-- CreateIndex
CREATE INDEX "UserBookmark_userId_trekId_idx" ON "UserBookmark"("userId", "trekId");

-- CreateIndex
CREATE INDEX "Trek_comment_trekId_userId_idx" ON "Trek_comment"("trekId", "userId");

-- AddForeignKey
ALTER TABLE "LikedEm" ADD CONSTRAINT "LikedEm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisLikedEm" ADD CONSTRAINT "DisLikedEm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookmark" ADD CONSTRAINT "UserBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trek_comment" ADD CONSTRAINT "Trek_comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trek_comment" ADD CONSTRAINT "Trek_comment_trekId_fkey" FOREIGN KEY ("trekId") REFERENCES "Trek"("tour_id") ON DELETE RESTRICT ON UPDATE CASCADE;
