/*
  Warnings:

  - The values [unfulfilled] on the enum `OrderFulfillmentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderFulfillmentStatus_new" AS ENUM ('pending', 'fulfilled', 'returned');
ALTER TABLE "public"."orders" ALTER COLUMN "fulfillmentStatus" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "fulfillmentStatus" TYPE "OrderFulfillmentStatus_new" USING (
  CASE WHEN "fulfillmentStatus"::text = 'unfulfilled' THEN 'returned'::"OrderFulfillmentStatus_new"
  ELSE "fulfillmentStatus"::text::"OrderFulfillmentStatus_new"
  END
);
ALTER TYPE "OrderFulfillmentStatus" RENAME TO "OrderFulfillmentStatus_old";
ALTER TYPE "OrderFulfillmentStatus_new" RENAME TO "OrderFulfillmentStatus";
DROP TYPE "public"."OrderFulfillmentStatus_old";
ALTER TABLE "orders" ALTER COLUMN "fulfillmentStatus" SET DEFAULT 'pending';
COMMIT;
