-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'processing', 'cancelled', 'done');

-- CreateEnum
CREATE TYPE "OrderFinancialStatus" AS ENUM ('pending', 'payed', 'refunded');

-- CreateEnum
CREATE TYPE "OrderFulfillmentStatus" AS ENUM ('pending', 'fulfilled', 'unfulfilled');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "price2" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "price3" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "price4" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "price5" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "line_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "order_id" UUID,
    "product_id" UUID,
    "itemOptions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "note" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "source" VARCHAR(255),
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "financialStatus" "OrderFinancialStatus" NOT NULL DEFAULT 'pending',
    "fulfillmentStatus" "OrderFulfillmentStatus" NOT NULL DEFAULT 'pending',
    "is_dine_in" BOOLEAN NOT NULL DEFAULT true,
    "discount" DECIMAL(10,2) NOT NULL,
    "user_phone" VARCHAR(20),
    "userNote" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
