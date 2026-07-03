/*
  Warnings:

  - Added the required column `totalDays` to the `Leave` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Leave" ADD COLUMN     "totalDays" INTEGER NOT NULL;
