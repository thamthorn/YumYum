# 🔧 Admin Test Panel - Testing Guide

## Access the Hidden Admin Panel

Visit: **http://localhost:3000/admin-test-matches**

## Complete Testing Flow

### Step 1: Generate Matches (Recommendations)

1. Go to `/onboarding/buyer` or `/login`
2. Complete **Quick Match** or **Full Flow** onboarding
3. This creates matches with status: `new_match`
4. These won't show in the Matches tab yet (they're just recommendations)

### Step 2: Approve Matches (Simulate OEM Acceptance)

1. Go to `/admin-test-matches`
2. You'll see all matches listed
3. Find matches with status `new_match`
4. Click **"Approve Match"** button
5. Status changes to `contacted`

### Step 3: View in Dashboard

1. Go to `/dashboard/buyer`
2. Click on **"Matches"** tab
3. Now you'll see the approved matches! ✅
4. Matches with status `new_match` won't appear (they're just recommendations)

### Step 4: Test "View Order" Button

1. Copy one of the OEM org IDs from console (check browser console in dashboard)
2. Open `app/api/orders/route.ts`
3. Replace `"PASTE_OEM_ORG_ID_HERE"` with the actual OEM org ID
4. Save and refresh dashboard
5. The match with that OEM will now show **"View Order"** button
6. Click it to test `/orders/mock-order-001` page

## What Each Status Means

- **`new_match`** → Initial recommendation (NOT shown in Matches tab)
- **`contacted`** → OEM approved/buyer contacted (SHOWN in Matches tab) ✅
- **`in_discussion`** → Active discussion (SHOWN in Matches tab) ✅

## Quick Reference

| Route                 | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `/admin-test-matches` | Hidden admin panel to approve matches            |
| `/dashboard/buyer`    | Main dashboard - Matches tab shows approved only |
| `/results`            | Shows initial recommendations (new_match)        |
| `/orders/[id]`        | Order detail page                                |

## Clean Up After Testing

When done testing:

1. Delete `/app/admin-test-matches/` folder
2. Delete `/app/api/admin-test-matches/` folder
3. Update `app/api/orders/route.ts` to use real data (see comments in file)
4. Delete this README file

## Troubleshooting

**No matches showing in admin panel?**

- Complete onboarding first to generate matches

**Match approved but not showing in dashboard?**

- Check the match status is NOT `new_match`
- Only `contacted`, `in_discussion`, etc. show in Matches tab

**No "View Order" button?**

- Update the mock order `oem_org_id` in `app/api/orders/route.ts`
- Make sure it matches an OEM in your matches
