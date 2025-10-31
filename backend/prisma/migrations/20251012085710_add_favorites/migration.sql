/*
  Warnings:

  - You are about to drop the column `district` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `district`,
    DROP COLUMN `gender`,
    DROP COLUMN `nickname`,
    DROP COLUMN `postalCode`,
    DROP COLUMN `province`;
