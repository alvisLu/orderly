-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "key" VARCHAR(128) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "rate_limit_buckets_expires_at_idx" ON "rate_limit_buckets"("expires_at");
