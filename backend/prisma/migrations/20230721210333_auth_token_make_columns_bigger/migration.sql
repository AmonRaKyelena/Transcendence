/*
  Warnings:

  - You are about to alter the column `userID` on the `AuthToken` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE "AuthToken" ALTER COLUMN "token" SET DATA TYPE VARCHAR(250),
ALTER COLUMN "userID" SET DATA TYPE VARCHAR(20);
