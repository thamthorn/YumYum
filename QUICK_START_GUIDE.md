# Quick Start Guide - YumYum OEM Platform

## 🚀 For Developers

### Running the Migration

```bash
# Apply the migration to Supabase
npx supabase db push

# Or via Supabase dashboard:
# 1. Go to Database > Migrations
# 2. Upload: supabase/migrations/20250207000000_add_tier_system_and_enhancements.sql
# 3. Click "Apply Migration"
```

### Environment Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Access at http://localhost:3000
```

### Key URLs

- OEM Onboarding: `/onboarding/oem/setup/products`
- OEM Dashboard: `/dashboard/oem`
- Buyer Search: `/oems`
- Pricing Page: `/pricing`

---

## 👤 For OEMs

### Getting Started

1. **Sign Up** → Create account at `/login`
2. **Complete Profile** → Go to `/onboarding/oem/setup/products`
3. **Add Products** → At least 1 product required
4. **Add Capabilities** → R&D, packaging, etc.
5. **Select Categories** → Food categories you serve
6. **Add Certifications** → Optional but recommended
7. **Review & Submit** → Check completeness score

### Understanding Your Dashboard

**Dashboard URL:** `/dashboard/oem`

**Quick Stats (All Tiers):**

- Products count → Click to manage
- Certifications count → Click to add more
- Profile completeness → Aim for 100%
- Subscription tier → Current tier badge

**Analytics (INSIGHTS + VERIFIED_PARTNER):**

- Profile views (last 30 days)
- Quote requests received
- Search appearances
- Top keywords driving traffic

**Media Gallery (VERIFIED_PARTNER only):**

- Upload factory tour videos
- QC process videos
- Product demonstrations

### Subscription Tiers

#### FREE (฿0/month)

✅ Basic profile listing  
✅ Product showcase  
✅ Buyer contact  
❌ No analytics  
❌ No media gallery

#### INSIGHTS (฿2,999/month)

✅ Everything in FREE  
✅ **Analytics dashboard**  
✅ **Keyword traffic data**  
✅ **Profile view tracking**  
❌ No media gallery

#### VERIFIED_PARTNER (฿9,999/month)

✅ Everything in INSIGHTS  
✅ **Video gallery (factory tours)**  
✅ **Featured placement**  
✅ **Priority matching (+5% score)**  
✅ **Verified badge**

### Upgrading Your Tier (MVP - Manual)

Since Stripe isn't integrated yet, contact admin to upgrade:

```sql
-- Admin updates in database
UPDATE subscriptions
SET tier = 'INSIGHTS'  -- or 'VERIFIED_PARTNER'
WHERE oem_org_id = '[your-org-id]';
```

---

## 🛍️ For Buyers

### Finding Manufacturers

1. **Browse OEMs** → Go to `/oems`
2. **Use Filters:**
   - Search by name/description
   - Filter by tier (Free/Insights/Verified)
   - Select categories (Beverages, Snacks, etc.)
   - Choose certifications (GMP, HACCP, etc.)
   - Set MOQ range (0-100,000)
   - Set lead time (0-90 days)
   - Select capabilities (R&D, Packaging, etc.)
3. **View Match Scores** → See why each OEM matches
4. **Bookmark OEMs** → Save favorites for later
5. **Contact OEM** → Click to view full profile

### Understanding Match Scores

**Score Breakdown (0-100%):**

- 40% - Category match
- 25% - MOQ within your range
- 15% - Lead time suitable
- 10% - Has required certifications
- 5% - Competitive pricing
- 5% - Tier bonus
- +2% per capability match

**Match Reasons:**

- "Category match" - Makes products in your category
- "MOQ within range" - Can handle your order size
- "Lead time suitable" - Can deliver on time
- "Has required certifications" - Meets quality standards
- "Verified Partner tier" - Premium manufacturer

---

## 🔧 For Admins

### Managing OEM Approvals

```sql
-- View pending OEMs
SELECT id, company_name, profile_status, created_at
FROM oem_profiles
WHERE profile_status = 'PENDING'
ORDER BY created_at DESC;

-- Approve OEM (requires completeness ≥ 80%)
UPDATE oem_profiles
SET profile_status = 'ACTIVE',
    verified_at = now()
WHERE id = '[oem-id]'
AND (
  SELECT check_oem_profile_completeness(id)
) >= 80;
```

### Tier Management

```sql
-- View all subscriptions
SELECT
  op.company_name,
  s.tier,
  s.status,
  s.current_period_start,
  s.current_period_end
FROM subscriptions s
JOIN oem_profiles op ON op.id = s.oem_profile_id
ORDER BY s.tier DESC, op.company_name;

-- Upgrade OEM to INSIGHTS
UPDATE subscriptions
SET tier = 'INSIGHTS',
    current_period_start = now(),
    current_period_end = now() + interval '30 days'
WHERE oem_profile_id = '[oem-id]';

-- Downgrade expired subscriptions
UPDATE subscriptions
SET tier = 'FREE',
    status = 'CANCELLED'
WHERE current_period_end < now()
AND status = 'ACTIVE';
```

### Analytics Queries

```sql
-- Top performing OEMs (by profile views)
SELECT
  op.company_name,
  COUNT(*) as profile_views,
  get_oem_tier(op.id) as tier
FROM oem_analytics_events e
JOIN oem_profiles op ON op.id = e.oem_profile_id
WHERE e.event_type = 'profile_view'
AND e.created_at >= now() - interval '30 days'
GROUP BY op.id, op.company_name
ORDER BY profile_views DESC
LIMIT 20;

-- Top search keywords
SELECT
  keyword,
  SUM(traffic_count) as total_traffic,
  COUNT(DISTINCT oem_profile_id) as oems_matched
FROM oem_keyword_traffic
WHERE date >= current_date - 30
GROUP BY keyword
ORDER BY total_traffic DESC
LIMIT 20;

-- Tier distribution
SELECT
  tier,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM subscriptions
WHERE status = 'ACTIVE'
GROUP BY tier
ORDER BY
  CASE tier
    WHEN 'VERIFIED_PARTNER' THEN 1
    WHEN 'INSIGHTS' THEN 2
    WHEN 'FREE' THEN 3
  END;
```

### Health Checks

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'subscriptions',
  'oem_capabilities',
  'product_images',
  'oem_analytics_events',
  'oem_media'
);
-- All should have rowsecurity = true

-- Check helper functions exist
SELECT proname, prosrc
FROM pg_proc
WHERE proname IN (
  'check_oem_profile_completeness',
  'get_oem_tier',
  'oem_has_insights_access',
  'log_analytics_event',
  'increment_keyword_traffic'
);
-- Should return 5 rows

-- Check for orphaned records
SELECT COUNT(*)
FROM subscriptions
WHERE oem_profile_id NOT IN (SELECT id FROM oem_profiles);
-- Should return 0
```

---

## 📊 Common Tasks

### Check OEM Completeness

```sql
SELECT
  company_name,
  check_oem_profile_completeness(id) as completeness,
  profile_status
FROM oem_profiles
WHERE profile_status != 'UNREGISTERED'
ORDER BY completeness DESC;
```

### Find OEMs Without Products

```sql
SELECT op.id, op.company_name, op.profile_status
FROM oem_profiles op
LEFT JOIN products p ON p.oem_profile_id = op.id
WHERE p.id IS NULL
AND op.profile_status IN ('DRAFT', 'PENDING', 'ACTIVE')
ORDER BY op.created_at DESC;
```

### Log Test Analytics Event

```sql
SELECT log_analytics_event(
  '[oem-profile-id]'::uuid,
  'profile_view'::analytics_event_type,
  '[viewer-user-id]'::uuid,
  '{"source": "direct_link", "referrer": "google"}'::jsonb
);
```

### Test Tier Access

```sql
-- Check if OEM has insights access
SELECT oem_has_insights_access('[oem-profile-id]'::uuid);

-- Get OEM's current tier
SELECT get_oem_tier('[oem-profile-id]'::uuid);
```

---

## 🐛 Troubleshooting

### Issue: Can't see analytics dashboard

**Solution:**

1. Check subscription tier:

```sql
SELECT tier FROM subscriptions WHERE oem_profile_id = '[id]';
```

2. Ensure tier is INSIGHTS or VERIFIED_PARTNER
3. Verify subscription status is ACTIVE

### Issue: Upload media fails

**Solution:**

1. Check tier is VERIFIED_PARTNER
2. Verify file size < 100MB
3. Check file type is video/\*
4. Ensure storage bucket exists in Supabase

### Issue: Match score always 0

**Solution:**

1. Check OEM has products
2. Verify products have categories
3. Ensure filters aren't too restrictive
4. Check products have MOQ and lead time set

### Issue: "Insufficient privileges" error

**Solution:**

1. Check user is authenticated
2. Verify user owns the resource
3. Ensure RLS policies are enabled:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = '[table-name]';
```

---

## 📱 Mobile Testing

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Test Checklist

- [ ] OEM wizard on mobile
- [ ] Dashboard cards stack properly
- [ ] Filters collapse on mobile
- [ ] OEM cards readable
- [ ] Touch targets ≥ 44px
- [ ] Forms submit correctly

---

## 🎯 Performance Tips

### Database

- Use indexes for common queries
- Limit analytics to last 90 days
- Archive old events quarterly
- Optimize RLS policies if slow

### Frontend

- Use server components for data fetching
- Client components only for interactivity
- Lazy load heavy components
- Cache API responses with TanStack Query

### API

- Return only needed fields
- Use `select()` to limit columns
- Add pagination for large lists
- Rate limit public endpoints

---

## 📚 Documentation Links

- **Full Implementation:** `IMPLEMENTATION_SUMMARY.md`
- **Testing Guide:** `AUTH_TESTING_GUIDE.md`
- **Original Plan:** `PLAN.md` (Part 2.2 - OEM User Flow)
- **Database Schema:** `docs/supabase-schema.md`

---

## 🎓 Learning Resources

### Supabase RLS

- [Official RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [RLS Performance Tips](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Next.js 14

- [App Router Docs](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

---

## ✅ Pre-Launch Checklist

### Database

- [ ] Migration applied successfully
- [ ] All RLS policies tested
- [ ] Helper functions working
- [ ] Indexes created for performance

### Backend

- [ ] All API endpoints tested
- [ ] Error handling verified
- [ ] Tier gates enforced
- [ ] Ownership checks in place

### Frontend

- [ ] Wizard flows tested end-to-end
- [ ] Dashboard loads real data
- [ ] Search filters work correctly
- [ ] Match scores calculate properly

### Security

- [ ] No API keys in frontend code
- [ ] RLS enabled on all tables
- [ ] Test unauthorized access blocked
- [ ] Admin functions protected

### Content

- [ ] Pricing page accurate
- [ ] Help documentation ready
- [ ] Email templates prepared
- [ ] Terms & privacy policy

---

## 🚀 Go Live!

1. **Final database check** - Run health queries
2. **Smoke test** - Complete one full OEM signup
3. **Monitor** - Watch for errors in first hour
4. **Iterate** - Collect feedback and improve

**Platform is ready! Happy launching! 🎉**
