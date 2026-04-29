DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'OrderStatus' AND n.nspname = 'public') THEN
    CREATE TYPE "public"."OrderStatus" AS ENUM (
      'pending_payment',
      'funded',
      'in_progress',
      'delivered',
      'approved',
      'completed',
      'cancelled',
      'refunded'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'PaymentStatus' AND n.nspname = 'public') THEN
    CREATE TYPE "public"."PaymentStatus" AS ENUM (
      'unpaid',
      'pending',
      'paid',
      'failed',
      'refunded'
    );
  END IF;
END $$;

UPDATE "public"."requests"
SET "status" = 'pending'
WHERE "status" = 'submitted';

ALTER TABLE "public"."requests"
ALTER COLUMN "status" SET DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS "public"."orders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "request_id" UUID NOT NULL,
  "buyer_id" UUID NOT NULL,
  "creator_id" UUID NOT NULL,
  "package_id" TEXT NOT NULL,
  "package_title" TEXT NOT NULL,
  "package_price" INTEGER NOT NULL,
  "tokens_label" TEXT NOT NULL,
  "request_snapshot" JSONB NOT NULL,
  "status" "public"."OrderStatus" NOT NULL DEFAULT 'pending_payment',
  "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'unpaid',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "orders_request_id_key" UNIQUE ("request_id"),
  CONSTRAINT "orders_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "orders_buyer_id_created_at_idx"
ON "public"."orders"("buyer_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "orders_creator_id_created_at_idx"
ON "public"."orders"("creator_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "orders_status_created_at_idx"
ON "public"."orders"("status", "created_at" DESC);
