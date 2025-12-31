/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `branches` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");
