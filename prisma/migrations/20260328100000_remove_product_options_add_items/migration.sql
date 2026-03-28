-- DropForeignKey
ALTER TABLE "product_options" DROP CONSTRAINT "product_options_product_type_id_fkey";

-- DropTable
DROP TABLE "product_options";

-- AlterTable
ALTER TABLE "product_type" ADD COLUMN "items" JSONB NOT NULL DEFAULT '[]';
