-- AlterTable
ALTER TABLE "store" ALTER COLUMN "opening" SET DEFAULT '{"weekly":{"0":[],"1":[],"2":[],"3":[],"4":[],"5":[],"6":[]}}';

-- Backfill existing rows that still hold the old empty-array shape (or NULL)
UPDATE "store"
SET "opening" = '{"weekly":{"0":[],"1":[],"2":[],"3":[],"4":[],"5":[],"6":[]}}'::jsonb
WHERE "opening" IS NULL OR "opening" = '[]'::jsonb;
