-- AlterTable
ALTER TABLE `tenants` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `rfc` VARCHAR(191) NULL;
