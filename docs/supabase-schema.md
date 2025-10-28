# Supabase Schema Plan

## 1. Scope & Goals
- Replace current mock data with a persistent Supabase Postgres schema that supports buyer onboarding, OEM discovery, quote/prototype requests, matches, saved lists, and order tracking.
- Integrate with Supabase Auth for secure buyer/OEM login while keeping room for admin tooling.
- Defer real-time messaging tables for now (will be layered on later without breaking changes).
- Favor composable relations and enums so the Next.js backend can expose clean, strongly typed APIs with minimal duplication.

## 2. Architectural Principles
- **Auth-first**: `auth.users` is the source of truth; keep a lightweight `profiles` mirror with role flags for authorization checks.
- **Organizations at the core**: buyers and OEMs are represented as `organizations` so we can support multi-user teams and shared resources.
- **Enumerations over free-text**: use Postgres enums for roles, statuses, and verification tiers to avoid string drift between backend and frontend.
- **Auditable changes**: timestamps, `created_by`, and event tables let us display histories (orders, matches, etc.) and debug issues quickly.
- **RLS friendly**: every table carries the necessary foreign keys so we can author row level security policies that map directly to the UI permissions.

## 3. High-Level Entity Map
```
[auth.users]
    │
    └──<profiles>
           │
           ├──<organization_members>──┐
           │                          │
           └──────────────┐           │
                          ▼           │
                     <organizations>──┘
                          │
        ┌─────────────────┼────────────────────────┐
        ▼                 ▼                        ▼
  <buyer_profiles>   <oem_profiles>         <matches>
        │                 │                        │
        │                 ├──<oem_services>        ├──<requests>
        │                 ├──<oem_certifications>  │      │
        │                 ├──<oem_languages>       │      ├──<request_files>
        │                 └──<oem_previous_products>      └──<request_updates>
        │
        ├──<buyer_preferences>
        ├──<buyer_certifications>
        └──<buyer_saved_oems>

<orders>
    ├──<order_line_items>
    ├──<order_events>
    └──<order_documents>
```

## 4. Enumerations
```sql
create type public.account_role as enum ('buyer', 'oem', 'admin');
create type public.organization_type as enum ('buyer', 'oem');
create type public.verification_tier as enum ('none', 'verified', 'certified', 'trusted_partner');
create type public.scale_type as enum ('small', 'medium', 'large');
create type public.match_status as enum ('new_match', 'contacted', 'in_discussion', 'quote_requested', 'declined', 'archived');
create type public.request_type as enum ('quote', 'prototype');
create type public.request_status as enum (
  'draft', 'submitted', 'pending_oem', 'quote_received', 'in_review',
  'accepted', 'in_production', 'completed', 'cancelled'
);
create type public.order_status as enum ('signed', 'preparation', 'manufacturing', 'delivering', 'completed', 'cancelled');
create type public.order_event_type as enum ('status_change', 'note', 'file_upload', 'payment', 'logistics');
```

Reference tables (denormalized lists) let us expand without altering enums:
```sql
create table public.industries (
  key text primary key,
  label text not null
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);
```

## 5. Core Tables

### `profiles`
- `id uuid primary key references auth.users(id) on delete cascade`
- `role account_role not null default 'buyer'`
- `display_name text`
- `first_name text`
- `last_name text`
- `phone text`
- `timezone text`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- Trigger keeps `updated_at` fresh.
- RLS idea: allow row access to the owner and service roles.

### `organizations`
- Represents either a buyer company or an OEM supplier.
- Columns: `id uuid pk`, `slug citext unique`, `type organization_type not null`, `display_name text`, `industry text references industries(key)`, `website text`, `description text`, `logo_url text`, `location text`, `country_code text`, `established_year int`, `headcount_range text`, `owner_id uuid references profiles(id)`, timestamps.
- Index on `(type, owner_id)` for quick lookups.

### `organization_members`
- `organization_id uuid references organizations(id) on delete cascade`
- `profile_id uuid references profiles(id) on delete cascade`
- `role_in_org text default 'member'` (use simple text for now; promote to enum if we add more roles)
- `invited_at`, `accepted_at`, `created_by`.
- Composite primary key `(organization_id, profile_id)`.
- Enables future multi-user access and simplifies RLS (`profile_id = auth.uid()`).

### `buyer_profiles`
- One-to-one with `organizations` of type `buyer`.
- Columns: `organization_id uuid pk references organizations(id)`, `company_name text`, `company_size text`, `annual_volume_estimate numeric`, `preferred_currency text`, `cross_border boolean`, `prototype_needed boolean`, `notes text`.

### `buyer_preferences`
- Captures onboarding flow answers.
- Columns: `id uuid pk`, `organization_id uuid references buyer_profiles(organization_id)`, `product_type text`, `moq_min int`, `moq_max int`, `timeline text`, `location_preference text`, `prototype_needed boolean`, `cross_border boolean`, `metadata jsonb`.
- `metadata` can store slider ranges or quick match flags.

### `buyer_certifications`
- Join table mapping desired certifications.
- Columns: `buyer_org_id uuid references buyer_profiles`, `certification_id uuid references certifications`, `importance text default 'nice_to_have'`.
- Primary key `(buyer_org_id, certification_id)`.

### `buyer_saved_oems`
- Bookmarks that power the "Saved" tab.
- Columns: `buyer_org_id uuid`, `oem_org_id uuid`, `created_at`.
- Primary key `(buyer_org_id, oem_org_id)`.

### `oem_profiles`
- Extends `organizations` where `type = 'oem'`.
- Columns: `organization_id uuid pk references organizations(id)`, `scale scale_type`, `moq_min int`, `moq_max int`, `lead_time_days int`, `response_time_hours int`, `prototype_support boolean`, `short_description text`, `cross_border boolean`, `rating numeric`, `total_reviews int`.

### `oem_services`
- Join table to `services`.
- Columns: `oem_org_id uuid references oem_profiles`, `service_id uuid references services`, `created_at`.
- PK `(oem_org_id, service_id)`.

### `oem_certifications`
- Columns: `oem_org_id uuid`, `certification_id uuid`, `verified boolean default false`, `verification_tier verification_tier default 'none'`, `verified_at timestamptz`, `verifier_id uuid references profiles`.
- PK `(oem_org_id, certification_id)`.

### `oem_languages`
- Columns: `oem_org_id uuid`, `language_code text`, `proficiency text`.
- Useful for filters and dashboards.

### `oem_previous_products`
- Columns: `id uuid pk`, `oem_org_id uuid`, `title text`, `image_url text`, `tags text[]`, `note text`, `created_at`.

## 6. Matching & Requests

### `matches`
- Connects a buyer organization to an OEM profile.
- Columns: `id uuid pk`, `buyer_org_id uuid`, `oem_org_id uuid`, `status match_status default 'new_match'`, `score numeric`, `source text` (e.g., `algorithm`, `manual`), `digest jsonb` (snapshot of the match context), `created_at`, `updated_at`, `last_viewed_at`.
- Unique constraint on `(buyer_org_id, oem_org_id)` to prevent duplicates.

### `requests`
- General table for both quote and prototype requests.
- Columns: `id uuid pk`, `buyer_org_id uuid`, `oem_org_id uuid`, `type request_type`, `status request_status`, `title text`, `product_brief text`, `quantity_min int`, `quantity_max int`, `unit text`, `timeline text`, `shipping_terms text`, `payment_terms text`, `add_escrow boolean`, `add_audit boolean`, `submitted_at`, `resolved_at`, `created_by uuid references profiles`, `updated_by uuid`, timestamps.
- Index `(buyer_org_id, created_at desc)` for dashboard queries.

### `request_files`
- Stores metadata for uploads kept in Supabase Storage (e.g., `requests` bucket).
- Columns: `id uuid pk`, `request_id uuid references requests(id) on delete cascade`, `bucket text`, `path text`, `mime_type text`, `size_bytes int`, `uploaded_by uuid`, `uploaded_at`.

### `request_updates`
- Timeline of status changes or messages about a request (non-chat).
- Columns: `id uuid pk`, `request_id uuid`, `status request_status`, `note text`, `created_by uuid`, `created_at`.
- Useful for showing "Quote Received on..." strips without adding messaging yet.

## 7. Orders

### `orders`
- Columns: `id uuid pk`, `buyer_org_id uuid`, `oem_org_id uuid`, `request_id uuid null references requests(id)`, `status order_status default 'signed'`, `total_value numeric(12,2)`, `currency text default 'THB'`, `quantity_total int`, `unit text`, `shipping_provider text`, `tracking_number text`, `production_start_date date`, `estimated_delivery_date date`, `actual_delivery_date date`, `created_by uuid`, `updated_by uuid`, timestamps.
- Index `(buyer_org_id, status)` for dashboard filtering.

### `order_line_items`
- Columns: `id uuid pk`, `order_id uuid references orders(id) on delete cascade`, `sku text`, `description text`, `quantity int`, `unit text`, `unit_price numeric(12,2)`, `currency text`.

### `order_events`
- Tracks stage transitions and operational notes.
- Columns: `id uuid pk`, `order_id uuid`, `stage order_status`, `event_type order_event_type`, `payload jsonb` (e.g., logistics info), `created_by uuid`, `created_at`.
- This maps to the progress bar UI by selecting the latest `stage`.

### `order_documents`
- Columns: `id uuid pk`, `order_id uuid`, `bucket text`, `path text`, `title text`, `uploaded_by uuid`, `uploaded_at`.
- Use for invoices, QC reports, etc.

## 8. Supporting Views & Helpers
- `buyer_dashboard_stats` view: aggregates counts of matches, requests, and orders for quick dashboard loading.
- `oem_dashboard_stats` view: aggregates lead counts, response metrics, and profile completion percentage.
- `active_orders` view: precomputes latest stage and percentages to feed `ORDER_STEPS` UI.
- Reusable SQL functions:
  - `public.handle_new_user()` trigger to insert into `profiles` after signup.
  - `public.ensure_organization_for_role()` to auto-create buyer organizations on first login.

## 9. Storage Buckets
- `requests` (private): design files, reference images from quote/prototype forms.
- `orders` (private): invoices, logistics documents.
- `avatars` (public-read via signed URLs): organization logos and profile photos.

## 10. Row Level Security Considerations
- Enable RLS on every table in `public`.
- Policies sketch:
  - `profiles`: `select`/`update` where `id = auth.uid()`.
  - `organizations`: members can `select`; owners can `update`.
  - `organization_members`: members can `select`; owners can manage membership.
  - `buyer_*` tables: `using (organization_id in memberships for auth.uid())`.
  - `oem_*` tables: same pattern for OEM members.
  - `matches` & `requests`: accessible to either the buyer or OEM organization involved.
  - `orders` and children: accessible to involved organizations and admins.

## 11. Next Steps Checklist
1. Define enums and reference tables via Supabase SQL editor or migrations.
2. Create tables in the order listed (respecting foreign keys).
3. Seed reference data (`industries`, `services`, `certifications`) from the existing `data/MockData.tsx`.
4. Configure storage buckets and policies.
5. Implement RLS policies and helper trigger functions.
6. Replace mock selectors in the frontend with Supabase queries (after backend service layer is in place).

> Messaging tables (threads, participants, messages) are intentionally omitted and can be layered on later without altering existing migrations.

