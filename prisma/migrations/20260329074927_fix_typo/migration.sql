/*
  Warnings:

  - The values [payed] on the enum `OrderFinancialStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderFinancialStatus_new" AS ENUM ('pending', 'paid', 'refunded');
ALTER TABLE "public"."orders" ALTER COLUMN "financialStatus" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "financialStatus" TYPE "OrderFinancialStatus_new" USING ("financialStatus"::text::"OrderFinancialStatus_new");
ALTER TYPE "OrderFinancialStatus" RENAME TO "OrderFinancialStatus_old";
ALTER TYPE "OrderFinancialStatus_new" RENAME TO "OrderFinancialStatus";
DROP TYPE "public"."OrderFinancialStatus_old";
ALTER TABLE "orders" ALTER COLUMN "financialStatus" SET DEFAULT 'pending';
COMMIT;
