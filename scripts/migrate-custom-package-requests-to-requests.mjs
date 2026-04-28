import { config as loadEnv } from "dotenv";
import pg from "pg";

loadEnv({ path: ".env.local" });
loadEnv();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Missing DIRECT_URL or DATABASE_URL");

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

function isUndefinedRelationError(err) {
  return err && typeof err === "object" && "code" in err && err.code === "42P01";
}

await client.connect();

try {
  await client.query("begin");

  // Ensure new table exists.
  await client.query(`
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
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS requests_creator_id_created_at_idx
    ON public.requests(creator_id, created_at DESC);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS requests_requester_id_created_at_idx
    ON public.requests(requester_id, created_at DESC);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS requests_request_type_created_at_idx
    ON public.requests(request_type, created_at DESC);
  `);

  // Copy rows from old table if it exists.
  let oldExists = true;
  try {
    await client.query("select 1 from public.custom_package_requests limit 1");
  } catch (e) {
    if (isUndefinedRelationError(e)) oldExists = false;
    else throw e;
  }

  if (oldExists) {
    // If old table had both custom + preselect in payload, infer from payload.type; else default custom_package.
    await client.query(`
      insert into public.requests
        (id, request_type, creator_id, requester_id, package_id, package_title, package_price, tokens_label, request_payload, status, created_at)
      select
        c.id,
        case
          when (c.request_payload ->> 'type') = 'preselect' then 'preselect_package'
          else 'custom_package'
        end as request_type,
        c.creator_id,
        c.requester_id,
        c.package_id,
        c.package_title,
        c.package_price,
        c.tokens_label,
        c.request_payload,
        case
          when c.status is null then 'pending'::public.request_status
          when lower(c.status) in ('submitted','pending') then 'pending'::public.request_status
          when lower(c.status) = 'processing' then 'processing'::public.request_status
          when lower(c.status) in ('accepted','approved') then 'accepted'::public.request_status
          when lower(c.status) = 'rejected' then 'rejected'::public.request_status
          when lower(c.status) = 'completed' then 'completed'::public.request_status
          else 'pending'::public.request_status
        end as status,
        c.created_at
      from public.custom_package_requests c
      on conflict (id) do nothing;
    `);

    await client.query("drop table public.custom_package_requests");
  }

  await client.query("commit");
  console.log("Migration complete: requests table is canonical.");
} catch (e) {
  await client.query("rollback").catch(() => {});
  throw e;
} finally {
  await client.end();
}

