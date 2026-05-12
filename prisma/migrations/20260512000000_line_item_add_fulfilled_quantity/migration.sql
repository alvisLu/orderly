-- AlterTable
ALTER TABLE "line_items" ADD COLUMN "fulfilled_quantity" INTEGER NOT NULL DEFAULT 0;

-- Backfill: existing fulfilled orders should have fulfilled_quantity match quantity
UPDATE "line_items" li
SET "fulfilled_quantity" = li."quantity"
FROM "orders" o
WHERE li."order_id" = o."id" AND o."fulfillmentStatus" = 'fulfilled';
