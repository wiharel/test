-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpauth_secret" TEXT,
ADD COLUMN     "otpauth_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registered" BOOLEAN NOT NULL DEFAULT false;
