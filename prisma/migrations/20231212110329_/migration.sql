/*
  Warnings:

  - Added the required column `deliveryTime` to the `Productreport` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Productreport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "deliveryTime" DATETIME NOT NULL
);
INSERT INTO "new_Productreport" ("id", "productId", "shopId") SELECT "id", "productId", "shopId" FROM "Productreport";
DROP TABLE "Productreport";
ALTER TABLE "new_Productreport" RENAME TO "Productreport";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
