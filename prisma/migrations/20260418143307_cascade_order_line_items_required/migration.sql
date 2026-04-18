/*
  Warnings:

  - Made the column `order_id` on table `line_items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "line_items" DROP CONSTRAINT "line_items_order_id_fkey";

-- AlterTable
ALTER TABLE "line_items" ALTER COLUMN "order_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
