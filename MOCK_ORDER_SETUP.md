# Mock Order Setup for Testing "View Order" Button

## Quick Setup Instructions

### Step 1: Find Your OEM Organization ID

1. Start your dev server: `pnpm dev`
2. Go to `/dashboard/buyer` in your browser
3. Navigate to the **Matches** tab
4. Open browser console (F12)
5. You'll see logs like: `🔍 OEM org ID: org_xxxxx | Name: Company Name`
6. Copy one of the OEM org IDs

### Step 2: Update Mock Data

1. Open `app/api/orders/route.ts`
2. Find this line:
   ```typescript
   oem_org_id: "PASTE_OEM_ORG_ID_HERE",
   ```
3. Replace `"PASTE_OEM_ORG_ID_HERE"` with the actual OEM org ID you copied
4. Save the file

### Step 3: Test the View Order Button

1. Refresh `/dashboard/buyer`
2. Go to **Matches** tab
3. You should now see a **"View Order"** button on the match that has the same OEM org ID
4. Click it to test the order detail page at `/orders/mock-order-001`

## Example

If your OEM org ID is `org_2r9lQLXfBH2zQi86zCfFZ3lDKYM`, update the mock data like this:

```typescript
const MOCK_ORDERS = [
  {
    id: "mock-order-001",
    oem_org_id: "org_2r9lQLXfBH2zQi86zCfFZ3lDKYM", // ✅ Updated!
    buyer_org_id: "test-buyer-org",
    status: "production",
    total_value: 50000,
    currency: "THB",
    quantity_total: 1000,
    unit: "units",
    created_at: new Date().toISOString(),
  },
];
```

## Remove Mock Data Later

When you're done testing and ready for production:

1. Open `app/api/orders/route.ts`
2. Uncomment the import:
   ```typescript
   import { getOrdersByBuyer } from "@/domain/orders/service";
   ```
3. Comment out `MOCK_ORDERS` array
4. Replace the return with the real implementation:
   ```typescript
   const context = await createSupabaseRouteContext();
   const orders = await getOrdersByBuyer(context);
   return NextResponse.json({ orders }, { status: 200 });
   ```
5. Delete this README file
