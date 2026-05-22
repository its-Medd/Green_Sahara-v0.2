-- AlterTable
ALTER TABLE `farmer_profiles`
  ADD COLUMN `city` VARCHAR(191) NULL,
  ADD COLUMN `equipment` TEXT NULL;

-- AlterTable
ALTER TABLE `products`
  ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `provider_profiles`
  ADD COLUMN `contact_phone` VARCHAR(191) NULL,
  ADD COLUMN `logo_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users`
  MODIFY `role` ENUM('PROVIDER', 'FARMER', 'ADMIN') NOT NULL;

-- CreateTable
CREATE TABLE `transport_updates` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `provider_id` INTEGER NOT NULL,
  `container_id` INTEGER NULL,
  `eta_minutes` INTEGER NULL,
  `transport_status` ENUM('WAITING', 'ON_THE_WAY', 'COMPLETED', 'DELAYED') NOT NULL DEFAULT 'WAITING',
  `assigned_truck` VARCHAR(191) NULL,
  `note` TEXT NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weather_snapshots` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `farmer_profile_id` INTEGER NOT NULL,
  `condition` VARCHAR(191) NOT NULL,
  `temperature` DOUBLE NOT NULL,
  `humidity` INTEGER NOT NULL,
  `wind_speed` DOUBLE NULL,
  `rain_chance` INTEGER NULL,
  `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alerts` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `severity` ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'INFO',
  `source` ENUM('WEATHER', 'SYSTEM', 'CONTAINER', 'MARKETPLACE', 'AI') NOT NULL DEFAULT 'SYSTEM',
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transport_updates`
  ADD CONSTRAINT `transport_updates_provider_id_fkey`
  FOREIGN KEY (`provider_id`) REFERENCES `provider_profiles`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `transport_updates`
  ADD CONSTRAINT `transport_updates_container_id_fkey`
  FOREIGN KEY (`container_id`) REFERENCES `containers`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `weather_snapshots`
  ADD CONSTRAINT `weather_snapshots_farmer_profile_id_fkey`
  FOREIGN KEY (`farmer_profile_id`) REFERENCES `farmer_profiles`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `alerts`
  ADD CONSTRAINT `alerts_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
