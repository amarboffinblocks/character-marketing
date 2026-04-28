import { config as loadEnv } from "dotenv";
import pg from "pg";

loadEnv({ path: ".env.local" });
loadEnv();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL");
}

const sql = `
CREATE TABLE IF NOT EXISTS public.custom_package_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  requester_id UUID NOT NULL,
  package_id TEXT NOT NULL,
  package_title TEXT NOT NULL,
  package_price INTEGER NOT NULL,
  tokens_label TEXT NOT NULL,
  request_payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS custom_package_requests_creator_id_created_at_idx
ON public.custom_package_requests(creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS custom_package_requests_requester_id_created_at_idx
ON public.custom_package_requests(requester_id, created_at DESC);
`;

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
await client.end();

console.log("custom_package_requests table ensured");
