/*
  Warnings:

  - A unique constraint covering the columns `[userID]` on the table `AuthToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AuthToken_token_key";

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_userID_key" ON "AuthToken"("userID");
