/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `Productreport` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Productreport_productId_key" ON "Productreport"("productId");
