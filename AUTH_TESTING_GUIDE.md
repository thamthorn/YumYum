# Authentication & Authorization Testing Guide

## Overview

This guide covers testing the tier-based access control system for the YumYum OEM platform.

## RLS Policies Verification

### 1. Public Access (No Authentication)

**What should work:**

- ✅ View OEM profiles (`oem_profiles` - SELECT)
- ✅ View OEM capabilities (`oem_capabilities` - SELECT)
- ✅ View product images (`product_images` - SELECT)
- ✅ View OEM media (`oem_media` - SELECT)
- ✅ Browse /oems page
- ✅ View individual OEM profiles

**What should fail:**

- ❌ Access OEM dashboard (`/dashboard/oem`)
- ❌ View analytics data
- ❌ Create/update/delete any records
- ❌ Access API endpoints (except public matching)

### 2. Authenticated User (Non-OEM)

**What should work:**

- ✅ All public access features
- ✅ Save/bookmark OEMs (`saved_oems` - INSERT/DELETE)
- ✅ View saved OEMs list
- ✅ Request quotes (RFQ)

**What should fail:**

- ❌ Access OEM dashboard
- ❌ Create/update OEM profile
- ❌ Upload products or certifications
- ❌ Access analytics endpoints

### 3. OEM Owner - FREE Tier

**What should work:**

- ✅ Access OEM dashboard (`/dashboard/oem`)
- ✅ Complete onboarding wizard
- ✅ Create/update/delete products (`/api/oem/products/*`)
- ✅ Manage certifications (`/api/oem/certifications/*`)
- ✅ Edit profile (`/api/oem/profile`)
- ✅ View basic profile stats (products count, certs count)
- ✅ View profile completeness score

**What should fail:**

- ❌ Access analytics dashboard (`/api/oem/insights`)
- ❌ View keyword traffic data (`oem_keyword_traffic`)
- ❌ View analytics events (`oem_analytics_events`)
- ❌ Upload media/videos (`/api/oem/media`)

### 4. OEM Owner - INSIGHTS Tier

**What should work:**

- ✅ All FREE tier features
- ✅ **Access analytics dashboard** (`/api/oem/insights`)
- ✅ **View profile views, quote requests**
- ✅ **View keyword traffic** (`oem_keyword_traffic`)
- ✅ **View analytics events** (`oem_analytics_events`)
- ✅ Download analytics reports

**What should fail:**

- ❌ Upload media/videos (requires VERIFIED_PARTNER)
- ❌ Schedule factory inspections

### 5. OEM Owner - VERIFIED_PARTNER Tier

**What should work:**

- ✅ All INSIGHTS tier features
- ✅ **Upload factory tour videos** (`/api/oem/media`)
- ✅ **Upload QC process videos**
- ✅ **Featured placement in search results**
- ✅ **Priority matching** (extra 5% score boost)
- ✅ Schedule factory inspections

## API Endpoint Access Control

### Public Endpoints

```
GET /api/matching/score - Anyone (logs analytics)
```

### Authenticated Endpoints

```
POST /api/oem/auth/register - Authenticated users only
```

### OEM Owner Endpoints (All Tiers)

```
GET    /api/oem/profile - Own profile only
PATCH  /api/oem/profile - Own profile only
GET    /api/oem/products - Own products only
POST   /api/oem/products - Own profile only
GET    /api/oem/products/[id] - Own product only
PATCH  /api/oem/products/[id] - Own product only
DELETE /api/oem/products/[id] - Own product only
GET    /api/oem/certifications - Own certs only
POST   /api/oem/certifications - Own profile only
GET    /api/oem/certifications/[id] - Own cert only
PATCH  /api/oem/certifications/[id] - Own cert only
DELETE /api/oem/certifications/[id] - Own cert only
GET    /api/oem/subscription - Own subscription only
POST   /api/oem/subscription - Own profile only (upgrade)
```

### Tier-Gated Endpoints

**INSIGHTS + VERIFIED_PARTNER:**

```
GET /api/oem/insights
- Returns 403 if tier = FREE
- Uses oem_has_insights_access() RLS function
```

**VERIFIED_PARTNER Only:**

```
GET    /api/oem/media
POST   /api/oem/media
DELETE /api/oem/media/[id]
- Returns 403 if tier != VERIFIED_PARTNER
- Checked in API route code
```

## Helper Functions for RLS

### `is_org_member(org_id uuid)`

- Checks if current user belongs to organization
- Used in all ownership policies

### `get_oem_tier(org_id uuid)`

- Returns current subscription tier
- Defaults to 'FREE' if no active subscription

### `oem_has_insights_access(org_id uuid)`

- Returns true if tier = INSIGHTS or VERIFIED_PARTNER
- Used in analytics RLS policies

## Testing Checklist

### Manual Testing Steps

#### 1. Test Public Access

```bash
# Should work
curl https://your-app.com/api/oem/profile/[oem-id]

# Should redirect to login
curl https://your-app.com/dashboard/oem
```

#### 2. Test FREE Tier OEM

```typescript
// Login as FREE tier OEM
// Navigate to /dashboard/oem
// Verify:
- ✅ Can see products count, certs count
- ✅ Can edit products via wizard
- ❌ No analytics section visible
- ✅ See upgrade prompt for Insights tier
```

#### 3. Test INSIGHTS Tier OEM

```typescript
// Upgrade to INSIGHTS tier (manual DB update for MVP)
UPDATE subscriptions
SET tier = 'INSIGHTS'
WHERE oem_org_id = '[oem-org-id]';

// Navigate to /dashboard/oem
// Verify:
- ✅ Analytics section visible
- ✅ Can see profile views, quote requests
- ✅ Keyword traffic table visible
- ❌ No media upload section
- ✅ See upgrade prompt for Verified Partner
```

#### 4. Test VERIFIED_PARTNER Tier

```typescript
// Upgrade to VERIFIED_PARTNER tier
UPDATE subscriptions
SET tier = 'VERIFIED_PARTNER'
WHERE oem_org_id = '[oem-org-id]';

// Navigate to /dashboard/oem
// Verify:
- ✅ All analytics features
- ✅ Media upload section visible
- ✅ Can upload videos
- ✅ Featured badge in search results
- ✅ Higher match scores (tier bonus)
```

#### 5. Test Cross-User Access

```typescript
// Login as OEM User A
// Try to access OEM User B's data:
GET /api/oem/products?oem_id=[user-b-id]
// Should return 403 Forbidden

// Try to edit OEM User B's product:
PATCH /api/oem/products/[user-b-product-id]
// Should return 403 Forbidden
```

## Database-Level Testing

### Test RLS Policies

```sql
-- Set user context
SET LOCAL role authenticated;
SET LOCAL request.jwt.claim.sub TO '[user-id]';

-- Try to access analytics as FREE tier
SELECT * FROM oem_analytics_events
WHERE oem_org_id = '[free-tier-oem-id]';
-- Should return 0 rows (RLS blocks)

-- Try to access analytics as INSIGHTS tier
SELECT * FROM oem_analytics_events
WHERE oem_org_id = '[insights-tier-oem-id]';
-- Should return rows (RLS allows)
```

### Test Helper Functions

```sql
-- Check tier
SELECT get_oem_tier('[oem-org-id]');
-- Should return 'FREE', 'INSIGHTS', or 'VERIFIED_PARTNER'

-- Check insights access
SELECT oem_has_insights_access('[oem-org-id]');
-- Should return true/false based on tier

-- Log analytics event
SELECT log_analytics_event(
  '[oem-org-id]'::uuid,
  'PROFILE_VIEW'::analytics_event_type,
  '[viewer-user-id]'::uuid,
  '{"source": "search"}'::jsonb
);
-- Should return event ID
```

## Security Considerations

### ✅ Implemented Security Features

1. **RLS enabled on all tables** - Database-level access control
2. **Ownership verification** - All API routes check user owns resource
3. **Tier-based gates** - Analytics/media endpoints check subscription tier
4. **Function security** - Helper functions use SECURITY DEFINER safely
5. **No direct DB access** - All operations through Supabase client
6. **JWT validation** - Supabase handles token verification

### ⚠️ Important Notes for Production

1. **API rate limiting** - Add rate limits to prevent abuse
2. **Input validation** - All endpoints validate request bodies
3. **File upload limits** - Media uploads should have size/type restrictions
4. **Analytics sampling** - Consider sampling for high-traffic OEMs
5. **Audit logging** - Track sensitive operations (tier upgrades, etc.)

## Common Issues & Solutions

### Issue: "Insufficient privileges" error

**Solution:** Check RLS policies with:

```sql
SELECT * FROM pg_policies WHERE tablename = '[table-name]';
```

### Issue: Analytics not showing for INSIGHTS tier

**Solution:** Verify subscription status:

```sql
SELECT tier, status FROM subscriptions WHERE oem_org_id = '[org-id]';
```

### Issue: Can't upload media as VERIFIED_PARTNER

**Solution:** Check tier in API route code, not just RLS

## Next Steps for Production

1. **Add E2E tests** - Use Playwright/Cypress for full user flows
2. **Load testing** - Test with 1000+ concurrent users
3. **Security audit** - Review all RLS policies and API routes
4. **Monitoring** - Add logging for failed auth attempts
5. **Documentation** - API docs with OpenAPI/Swagger
