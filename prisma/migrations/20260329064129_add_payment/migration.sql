/*
  Warnings:

  - You are about to drop the column `is_dine_in` on the `orders` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('cash', 'custom');

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "is_dine_in",
ADD COLUMN     "is_dining" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transactions" JSONB DEFAULT '[]';

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "is_pos_available" BOOLEAN NOT NULL DEFAULT true,
    "is_menu_available" BOOLEAN NOT NULL DEFAULT true,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);
