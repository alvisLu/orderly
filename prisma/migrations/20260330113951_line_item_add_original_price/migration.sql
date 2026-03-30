-- AlterTable
ALTER TABLE "line_items" ADD COLUMN "originalPrice" DECIMAL(10,2);
UPDATE "line_items" SET "originalPrice" = "price";
ALTER TABLE "line_items" ALTER COLUMN "originalPrice" SET NOT NULL;

