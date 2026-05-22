/*
  Warnings:

  - You are about to alter the column `image_url` on the `ai_analyses` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `image_url` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `avatar_url` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `ai_analyses` MODIFY `image_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `compost_lots` MODIFY `notes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `products` MODIFY `description_fr` VARCHAR(191) NOT NULL,
    MODIFY `description_ar` VARCHAR(191) NOT NULL,
    MODIFY `image_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `preferred_language` VARCHAR(191) NOT NULL DEFAULT 'fr',
    MODIFY `avatar_url` VARCHAR(191) NULL;
