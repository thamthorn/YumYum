# Request Approval Flow

## Overview
This document describes the updated flow where requests only appear in the order creation interface after their associated match has been approved by an admin.

## Flow Diagram

```
User submits quote/prototype
         ↓
Request created (status: 'submitted')
Match created (status: 'new_match')
         ↓
Request appears in /admin-test-matches
         ↓
Admin clicks "Approve Match"
         ↓
Match status → 'contacted'
         ↓
Request NOW appears in /admin-create-order
         ↓
Admin creates order
```

## Implementation Details

### 1. Match Status Progression
- **new_match** - Initial state, request visible only in `/admin-test-matches`
- **contacted** - Approved match, request visible in `/admin-create-order`
- **in_discussion** - Further progression, still visible in order creation
- **quote_requested** - Quote stage, still visible in order creation
- **declined** - Match rejected, not visible in order creation
- **archived** - Match archived, not visible in order creation

### 2. API Endpoints

#### `/api/admin-test-matches` (GET)
- Returns all matches regardless of status
- Used by admin match approval interface
- No filtering applied

#### `/api/admin-test-matches` (POST)
- Approves a match by updating status to 'contacted'
- Takes `matchId` in request body
- Returns updated match

#### `/api/admin-create-order/requests` (GET) - NEW
- Returns only requests with **approved matches**
- A request is included if its buyer-OEM pair has a match with status:
  - `contacted`
  - `in_discussion`
  - `quote_requested`
- Filters out requests with only `new_match`, `declined`, or `archived` matches

#### `/api/requests` (GET)
- Unchanged - returns all requests for buyer/OEM dashboards
- Used by other parts of the application

### 3. Frontend Components

#### `/app/admin-test-matches/page.tsx`
- Lists all matches with "Approve" button
- Clicking "Approve" changes match status to 'contacted'
- No changes to existing functionality

#### `/app/admin-create-order/page.tsx`
- Now uses `/api/admin-create-order/requests` instead of `/api/requests`
- Shows message when no approved requests available
- Guides admin to approve matches first

## Database Schema

### matches table
```sql
- id (uuid)
- buyer_org_id (uuid) → organizations
- oem_org_id (uuid) → organizations
- status (match_status) - ENUM: new_match | contacted | in_discussion | quote_requested | declined | archived
- created_at, updated_at
```

### requests table
```sql
- id (uuid)
- buyer_org_id (uuid) → organizations
- oem_org_id (uuid) → organizations
- status (request_status)
- type (request_type)
- ... other fields
```

### Relationship
- A request is linked to a match via the **buyer_org_id + oem_org_id pair**
- Each buyer-OEM pair can have only ONE match (enforced by unique constraint)
- A request is considered "approved" if its buyer-OEM pair has a match with status: contacted, in_discussion, or quote_requested

## Testing Workflow

### Step 1: Submit a Quote Request
1. Login as buyer
2. Navigate to `/request/quote` or `/request/prototype`
3. Fill in the form and submit
4. System creates:
   - Request (status: 'submitted')
   - Match (status: 'new_match')

### Step 2: Verify Match Appears in Admin Test Matches
1. Navigate to `/admin-test-matches`
2. Find the newly created match
3. Verify it shows status 'new_match'
4. **DO NOT** approve yet

### Step 3: Verify Request NOT in Order Creation
1. Navigate to `/admin-create-order`
2. Open the "Select Approved Request" dropdown
3. Verify the request **does not appear** (or see "No approved requests available")

### Step 4: Approve the Match
1. Go back to `/admin-test-matches`
2. Click "Approve" on the match
3. Verify status changes to 'contacted'
4. Green success toast should appear

### Step 5: Verify Request NOW Appears in Order Creation
1. Navigate to `/admin-create-order`
2. Open the "Select Approved Request" dropdown
3. Verify the request **now appears** in the list
4. Proceed to create an order

## Key Benefits

1. **Controlled Flow**: Admins explicitly approve matches before orders can be created
2. **Quality Gate**: Prevents accidental order creation for unvetted matches
3. **Clear Separation**: Test match approval vs order creation are distinct steps
4. **Better UX**: Users see clear messaging about why requests aren't available yet

## Edge Cases Handled

1. **No approved matches**: Shows helpful message to admin
2. **Match declined**: Request won't appear in order creation
3. **Match archived**: Request won't appear in order creation
4. **Multiple requests same buyer-OEM**: All with same approved match will appear
5. **Request without OEM**: Won't have match, won't appear (existing behavior)

## Migration Notes

- **No database migration required** - uses existing schema
- **No breaking changes** - other endpoints unchanged
- **Backward compatible** - existing requests with approved matches will appear immediately

## Related Files

- `/app/api/admin-create-order/requests/route.ts` - NEW endpoint
- `/app/admin-create-order/page.tsx` - Updated to use new endpoint
- `/app/api/admin-test-matches/route.ts` - Unchanged
- `/app/admin-test-matches/page.tsx` - Unchanged
