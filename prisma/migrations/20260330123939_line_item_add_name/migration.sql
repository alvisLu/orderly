-- AlterTable
ALTER TABLE "line_items" ADD COLUMN "cost" DECIMAL(10,2),
ADD COLUMN "name" VARCHAR(255);

UPDATE "line_items" li
SET
  "cost" = p."cost",
  "name" = p."name"
FROM "products" p
WHERE li."product_id" = p."id";

ALTER TABLE "line_items"
  ALTER COLUMN "cost" SET NOT NULL,
  ALTER COLUMN "name" SET NOT NULL;
