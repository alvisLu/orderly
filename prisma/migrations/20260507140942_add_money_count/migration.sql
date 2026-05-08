-- CreateTable
CREATE TABLE "money_counts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "currencies" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "money_counts_pkey" PRIMARY KEY ("id")
);
