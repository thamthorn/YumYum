# Backend Architecture Plan

This plan assumes we are keeping the current Next.js App Router structure and layering Supabase as our primary data source. The focus is on clean separations, predictable error handling, and reusable utilities so we can gradually swap the mock data modules for real services.

## 1. Project Structure (proposed additions)
```
app/
  api/
    auth/
      route.ts            # optional webhook for Supabase auth events
    organizations/
      route.ts            # create/list organizations
    requests/
      route.ts            # create/list requests
      [id]/
        route.ts          # read/update/delete a single request
    matches/
      route.ts
    orders/
      route.ts
      [id]/
        route.ts
lib/
  supabase/
    server.ts             # server-side client factory
    client.ts             # browser-side client factory (if needed)
  auth/
    get-session.ts        # wraps Supabase auth helpers
    require-user.ts       # throws AuthError if no session
  http/
    responses.ts          # JSON helpers
    error-handler.ts      # wraps route handlers/server actions
domain/
  organizations/
    schema.ts             # zod schema + types
    service.ts            # business logic
    repo.ts               # Supabase queries
  requests/
    schema.ts
    service.ts
    repo.ts
  matches/
    schema.ts
    service.ts
    repo.ts
  orders/
    schema.ts
    service.ts
    repo.ts
services/
  supabase.ts             # central place for queries that span domains
utils/
  errors.ts               # shared error classes
  logger.ts               # instrumentation (console for now)
```

Key ideas:
- **Domain modules** encapsulate validation, business rules, and persistence.
- **Route handlers / server actions** only orchestrate between request parsing and domain calls.
- **Repositories** are responsible for all Supabase interactions; they return typed results or throw domain-aware errors.

## 2. Supabase Client Utilities

Create thin factories so we can re-use them in RSCs, route handlers, and server actions:

```ts
// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

export const createSupabaseServerClient = () =>
  createServerComponentClient<Database>({ cookies });
```

For client-side usage (if needed), wrap `createClientComponentClient` in `lib/supabase/client.ts`.

## 3. Validation & Types
- Define `Database` types via `supabase gen types typescript --local` once the schema is live.
- Use `zod` in each domain `schema.ts` for:
  - Request payload validation (`CreateRequestInput`, `UpdateOrderInput`, etc.).
  - Derived types exported to services and React components.
- Keep DTOs (`domain/.../schema.ts`) separate from persistence models (`types/database`).

## 4. Error Handling Strategy

Create a small hierarchy:
```ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code: string = "internal_error",
    public readonly cause?: unknown,
  ) {
    super(message);
  }
}

export class AuthError extends AppError {
  constructor(message = "Not authenticated") {
    super(message, 401, "auth_required");
  }
}

export class ValidationError extends AppError {
  constructor(issues: ZodIssue[]) {
    super("Validation failed", 400, "validation_error", issues);
  }
}
```

Use a higher-order helper to wrap API routes:
```ts
export const withErrorHandling =
  (handler: RouteHandler) =>
  async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      return toErrorResponse(error); // maps AppError -> JSON Response
    }
  };
```

`toErrorResponse` lives in `lib/http/error-handler.ts` and ensures consistent payloads (`{ error: { code, message, details? } }`).

## 5. Domain Service Example (Requests)

```ts
// domain/requests/service.ts
import { ValidationError } from "@/utils/errors";
import { createRequestSchema } from "./schema";
import * as repo from "./repo";

export async function createRequest(input: unknown, context: RequestContext) {
  const parsed = createRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues);
  }

  const { buyerOrgId, oemOrgId } = parsed.data;
  // Authorization checks
  await context.authorizer.ensureMembership(buyerOrgId);

  return repo.insertRequest(parsed.data, context.supabase);
}
```

`RequestContext` is a lightweight object injected by route handlers that bundles:
- `supabase`: server client scoped to the current request.
- `session`: Supabase session with user id.
- `authorizer`: helper with methods `ensureMembership`, `ensureBuyer`, `ensureOem`.

## 6. Repository Example (Requests)

```ts
// domain/requests/repo.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TablesInsert } from "@/types/database";
import { AppError } from "@/utils/errors";

export async function insertRequest(
  data: TablesInsert<"requests">,
  supabase: SupabaseClient,
) {
  const { data: row, error } = await supabase
    .from("requests")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new AppError("Failed to create request", 500, "request_create_failed", error);
  }

  return row;
}
```

Repositories never swallow Supabase errors—everything is translated into `AppError` with a deterministic `code`.

## 7. Authorization Utilities
- `lib/auth/require-user.ts`: obtains the session, throws `AuthError` if absent.
- `lib/auth/get-role.ts`: returns the `profiles.role` and organization memberships in one query.
- `lib/auth/authorizer.ts`: class with methods `ensureMembership(orgId)`, `ensureBuyerOrg(orgId)`, `ensureOemOrg(orgId)`. Each method queries `organization_members` (cached per request) and throws `AppError(403, ...)` when violated.

Caching membership data in the request context prevents N+1 issues across service calls.

## 8. API Route Pattern

```ts
// app/api/requests/route.ts
import { withErrorHandling } from "@/lib/http/error-handler";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { createRequest } from "@/domain/requests/service";

export const POST = withErrorHandling(async (request: Request) => {
  const { supabase, session, authorizer } = await createSupabaseRouteContext(request);
  const payload = await request.json();

  const result = await createRequest(payload, { supabase, session, authorizer });
  return jsonResponse(result, 201);
});

export const GET = withErrorHandling(async (request) => {
  const { supabase, session, authorizer } = await createSupabaseRouteContext(request);
  const query = parseRequestQuery(request); // zod validated
  const data = await listRequests(query, { supabase, session, authorizer });
  return jsonResponse(data);
});
```

`createSupabaseRouteContext` pulls the session via `createSupabaseServerClient`, preloads memberships, and instantiates the `authorizer`.

## 9. Server Actions & RSC Integration
- For forms currently using client-side state (e.g., onboarding), introduce server actions to persist data:
  - `app/onboarding/buyer/actions.ts` exports `saveBuyerPreferencesAction`.
  - Actions call the same domain services and reuse `withErrorHandling` style wrappers (Next.js actions can throw `AppError` and be caught by the form).
- Use revalidation tags (e.g., `revalidateTag("requests:list")`) in services to keep UI fresh when data changes.

## 10. Logging & Observability
- Add `utils/logger.ts` with a simple wrapper (console for dev, ready for integration with `pino` or `sentry` later).
- Centralize Supabase errors so we can log `error.code`/`error.hint` for debugging without leaking details to the client.

## 11. Migration & Feature Rollout Strategy
1. Generate Supabase types and scaffold `lib/supabase`.
2. Replace `lib/auth` localStorage helpers with Supabase session helpers; update `ProtectedClient`.
3. Migrate onboarding flow to call `saveBuyerPreferencesAction`.
4. Swap `data/MockData.tsx` usage gradually:
   - Step 1: `getOEMsByIndustry` -> server-side fetch from `oem_profiles` with filters.
   - Step 2: Dashboard stats from view `buyer_dashboard_stats`.
   - Step 3: Orders pages pulling from `orders` + `order_events`.
5. Remove mock data imports once each feature is backed by Supabase.

## 12. Testing Approach
- Unit test domain services with Vitest (mock Supabase repos).
- Integration test route handlers using Next.js `app-router-handler-tester` or supertest with mocked Supabase client responses.
- End-to-end smoke tests (Playwright) hitting deployed Supabase instance to ensure RLS + API interplay works.

This layered setup keeps Supabase-specific code in repositories and context factories, while domain services stay framework-agnostic—making it easier to evolve the codebase and maintain consistent error semantics across route handlers, server actions, and potential background jobs.

## 13. Current Implementation Snapshot
- Added `lib/supabase/{server,client,route-handler}.ts`, `lib/http/{responses,error-handler,route-context}.ts`, and shared `utils/{errors,logger}.ts`.
- Introduced Supabase-aware auth utilities under `lib/auth`, and the app now consumes Supabase sessions directly via `lib/supabase/session-context.tsx`.
- Materialised the first domain slice (`domain/requests`) with schema validation, repository helpers, and `app/api/requests/route.ts`.
- Stubbed `types/database.ts` to unblock development; regenerate it with `supabase gen types typescript` once the real schema is applied.
- New runtime env requirements: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (server-side helpers read credentials via cookies/session).
- Install the new packages before running the dev server: `pnpm install`.
