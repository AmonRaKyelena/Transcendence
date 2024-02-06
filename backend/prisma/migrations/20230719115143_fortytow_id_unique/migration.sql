/*
  Warnings:

  - A unique constraint covering the columns `[fortytwo_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_fortytwo_id_key" ON "User"("fortytwo_id");
