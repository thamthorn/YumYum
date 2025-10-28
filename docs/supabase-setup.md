# Supabase Setup Guide

Follow these steps to connect the project to a Supabase backend and apply the schema that powers the new Next.js services.

## 1. Install prerequisites
- **Supabase CLI**: `brew install supabase/tap/supabase` (macOS) or follow [official docs](https://supabase.com/docs/guides/cli).
- **pg_dump / psql**: ensure PostgreSQL client tools are available (the Supabase CLI depends on them).
- **Node.js tooling**: the repo already uses `pnpm`.

## 2. Authenticate the CLI
```bash
supabase login
```
Paste the access token from the Supabase dashboard (Account → Access Tokens).

## 3. Create or link a Supabase project
1. Create a new project in the Supabase dashboard (or grab an existing one).
2. Note the **Project Reference ID** (a 20-character string like `abcd1234efgh5678ijkl`).
3. Update `supabase/config.toml`:
   ```toml
   project_id = "YOUR_PROJECT_REF"
   ```

## 4. Configure environment variables
Copy `.env.example` to `.env.local` and fill in the keys from your Supabase project settings (Project Settings → API):
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_DB_PASSWORD=<database-password>
```

## 5. Push the schema
The migration in `supabase/migrations/20250203170000_initial.sql` mirrors the database design documented in `docs/supabase-schema.md`.

- To run locally with the Supabase emulator:
  ```bash
  supabase start        # boots the local stack
  supabase db reset     # applies migrations from supabase/migrations
  ```
- To push to a remote project (irreversible in production):
  ```bash
  supabase db push
  ```

After applying the migration, regenerate TypeScript types so `types/database.ts` reflects the actual schema:
```bash
supabase gen types typescript --project-ref <project-ref> --schema public > types/database.ts
```

To populate the demo data bundled with this repo, run the seed script:
```bash
supabase db reset --seed supabase/seed.sql
```
This inserts the sample OEM catalog (matching the previous mock data) into your project.

## 6. Seed lookup data (optional)
Populate `industries`, `services`, and `certifications` with the values you need. You can:
- Use the Supabase SQL editor and run `insert` statements, or
- Create a SQL seed file under `supabase/seed.sql` and execute `supabase db reset --use-migra` (or run it manually with `psql`).

## 7. Connect the Next.js app
1. Install dependencies (includes the Supabase client libraries):
   ```bash
   pnpm install
   ```
2. Run the dev server with the env vars loaded:
   ```bash
   pnpm dev
   ```
   Authenticated requests now flow through the Supabase-powered API routes (e.g., `app/api/requests/route.ts`).

## 8. Next steps checklist
- Wire the UI to Supabase auth flows (the app now uses `SupabaseProvider` / `useSupabase`; extend the remaining views to rely on it).
- Incrementally replace mock data selectors with Supabase queries or domain services.
- Add storage buckets (`requests`, `orders`, `avatars`) via the Supabase dashboard and configure policies as needed.
- Expand RLS policies or helper functions if you introduce new roles or workflow stages.

Once these steps are complete, Supabase becomes the single source of truth for authentication, onboarding, matching, requests, and order tracking across the app.
