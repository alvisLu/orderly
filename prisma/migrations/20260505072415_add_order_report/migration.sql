-- CreateTable
CREATE TABLE "order_reports" (
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "done_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cancelled_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unfinished_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "processing_count" INTEGER NOT NULL DEFAULT 0,
    "paid_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "refund_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "people_count" INTEGER NOT NULL DEFAULT 0,
    "avg_per_order" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "avg_per_person" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "byGateway" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_reports_pkey" PRIMARY KEY ("date")
);
