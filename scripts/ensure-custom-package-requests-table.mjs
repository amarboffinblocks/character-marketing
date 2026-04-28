import { config as loadEnv } from "dotenv";
import pg from "pg";

loadEnv({ path: ".env.local" });
loadEnv();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL");
}

const sql = `
DO $$
BEGIN
  CREATE TYPE public.request_status AS ENUM ('pending','processing','accepted','rejected','completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type TEXT NOT NULL,
  creator_id UUID NOT NULL,
  requester_id UUID NOT NULL,
  package_id TEXT NOT NULL,
  package_title TEXT NOT NULL,
  package_price INTEGER NOT NULL,
  tokens_label TEXT NOT NULL,
  request_payload JSONB NOT NULL,
  status public.request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS requests_creator_id_created_at_idx
ON public.requests(creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS requests_requester_id_created_at_idx
ON public.requests(requester_id, created_at DESC);

CREATE INDEX IF NOT EXISTS requests_request_type_created_at_idx
ON public.requests(request_type, created_at DESC);
`;

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
await client.end();

console.log("requests table ensured");
