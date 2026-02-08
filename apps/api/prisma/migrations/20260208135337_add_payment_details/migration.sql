/*
  Warnings:

  - The values [OWNER,MANAGER] on the enum `users_role` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `paymentMethod` on table `sales` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `sales` ADD COLUMN `changeAmount` DECIMAL(10, 2) NULL,
    ADD COLUMN `customerId` VARCHAR(191) NULL,
    ADD COLUMN `receivedAmount` DECIMAL(10, 2) NULL,
    MODIFY `paymentMethod` ENUM('CASH', 'CARD', 'TRANSFER') NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'CASHIER') NOT NULL DEFAULT 'CASHIER';

-- CreateTable
CREATE TABLE `customers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `taxId` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,

    INDEX `customers_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
