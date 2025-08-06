/*
  Warnings:

  - You are about to drop the column `games_played` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `losses` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `points_conceded` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `points_scored` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `wins` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL
);
INSERT INTO "new_User" ("id", "username") SELECT "id", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
