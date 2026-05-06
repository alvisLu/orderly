-- CreateEnum
CREATE TYPE "OnlineOrdering" AS ENUM ('auto', 'enabled', 'disabled');

-- AlterTable
ALTER TABLE "store" ADD COLUMN "online_ordering" "OnlineOrdering" NOT NULL DEFAULT 'auto';
