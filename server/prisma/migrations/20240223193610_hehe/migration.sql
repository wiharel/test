/*
  Warnings:

  - The primary key for the `UserFriends` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `frienshipId` was added to the `UserFriends` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "UserFriends" DROP CONSTRAINT "UserFriends_pkey",
ADD COLUMN     "frienshipId" TEXT NOT NULL,
ADD CONSTRAINT "UserFriends_pkey" PRIMARY KEY ("frienshipId");
