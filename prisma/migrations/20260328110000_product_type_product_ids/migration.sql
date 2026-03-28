-- AlterTable: replace product_id (single) with product_ids (array)
ALTER TABLE "product_type" ADD COLUMN "product_ids" UUID[] NOT NULL DEFAULT '{}';

-- Migrate existing data
UPDATE "product_type" SET "product_ids" = ARRAY["product_id"] WHERE "product_id" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "product_type" DROP CONSTRAINT IF EXISTS "product_type_product_id_fkey";

-- DropColumn
ALTER TABLE "product_type" DROP COLUMN "product_id";
