# Prisma + Supabase Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in:
   - `DATABASE_URL`: Supabase pooled Postgres connection string.
   - `DIRECT_URL`: optional direct Postgres connection string (for some workflows).
3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Open Prisma Studio:

```bash
npm run prisma:studio
```

The Prisma client singleton is available at `src/lib/prisma.ts`.

Prisma CLI config is defined in `prisma.config.ts`.
