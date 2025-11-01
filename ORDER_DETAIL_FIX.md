# Order Detail Page Fix

## Problem

When creating an order via the admin interface (`/admin-create-order`), the API returned a successful 201 response, but navigating to the order detail page (`/orders/{id}`) showed "Order Not Found".

## Root Cause

The order detail page (`app/orders/[id]/page.tsx`) was using `getOrderById()` from `MockData.tsx` instead of fetching data from the real API endpoint.

### Code Before:

```typescript
const order = getOrderById(id); // MockData function
```

This was a client-side component that wasn't making any API calls - it was just looking up data in a mock data array that didn't contain the newly created orders.

## Solution

Converted the order detail page to fetch real data from the API using React Query's `useQuery` hook.

### Changes Made:

1. **Updated imports** (`app/orders/[id]/page.tsx`):

   - Added `useQuery` from `@tanstack/react-query`
   - Added `Loader2`, `Calendar`, `Building` icons
   - Removed mock data functions (removed `getOrderById`, `ORDER_STEPS`, `orderPercent`, `formatDateShort` from imports)
   - Kept `ROUTES` for navigation

2. **Added API data fetching**:

```typescript
const {
  data: orderData,
  isLoading,
  error,
} = useQuery({
  queryKey: ["order", id],
  queryFn: async () => {
    const response = await fetch(`/api/orders/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }
    const data = await response.json();
    return data.order;
  },
});
```

3. **Added loading state**:

   - Displays spinner and "Loading order..." message while fetching

4. **Updated data structure** to match real API response:

   - Changed from mock structure to database structure
   - Order fields: `oem_organization`, `buyer_organization`, `order_line_items`, `order_events`, `status`, `created_at`
   - Line item fields: `description`, `quantity`, `unit`, `unit_price`, `currency`
   - Event fields: `event_type`, `stage`, `created_at`, `payload`

5. **Simplified UI**:

   - Removed mock-specific features (shipping info, progress bar, timeline)
   - Added Order Information card showing OEM and order date
   - Display order items with description, quantity, unit price, and total
   - Calculate total from line items
   - Show order events timeline if available
   - Format currency using Intl.NumberFormat with dynamic currency

6. **Updated admin order creation** (`app/admin-create-order/page.tsx`):
   - Added `useRouter` from `next/navigation`
   - Modified `onSuccess` callback to navigate to created order:

```typescript
onSuccess: (data) => {
  toast.success("Order created successfully!");
  queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
  queryClient.invalidateQueries({ queryKey: ["admin-requests"] });

  // Navigate to the created order
  if (data.order?.id) {
    router.push(`/orders/${data.order.id}`);
  }
};
```

7. **Removed Suspense wrapper** from the page component as it's no longer needed

## API Response Structure

The API endpoint `/api/orders/{id}` returns:

```typescript
{
  order: {
    id: string;
    buyer_org_id: string;
    oem_org_id: string;
    request_id: string;
    status: "signed" | "preparation" | "manufacturing" | "delivering" | "completed" | "cancelled";
    created_at: string;
    updated_at: string;
    oem_organization: {
      id: string;
      display_name: string;
      slug: string;
    };
    buyer_organization: {
      id: string;
      display_name: string;
    };
    order_line_items: [
      {
        id: string;
        order_id: string;
        description: string;
        quantity: number;
        unit: string;
        unit_price: string;
        currency: string;
        created_at: string;
      }
    ];
    order_events: [
      {
        id: string;
        order_id: string;
        event_type: string;
        stage: string;
        payload: any;
        created_at: string;
        created_by: string;
      }
    ];
  }
}
```

## Testing

1. Navigate to `/admin-create-order`
2. Select a request with an assigned OEM
3. Add line items (description, quantity, unit, unit price)
4. Select order status
5. Click "Create Order"
6. Verify:
   - Success toast appears
   - Automatically navigates to `/orders/{order-id}`
   - Order details display correctly
   - Line items show with proper formatting
   - Total is calculated correctly
   - Order events timeline appears if available

## Benefits

- ✅ Order detail page now displays real database data
- ✅ Admin can create order and immediately view it
- ✅ Consistent with other pages that use React Query
- ✅ Loading states for better UX
- ✅ Proper error handling
- ✅ Automatic navigation after order creation
- ✅ Dynamic currency formatting
- ✅ Complete end-to-end order flow now works

## Related Files

- `app/orders/[id]/page.tsx` - Order detail page (completely rewritten)
- `app/admin-create-order/page.tsx` - Admin order creation (updated navigation)
- `app/api/orders/[id]/route.ts` - API endpoint (no changes, already working)
- `domain/orders/service.ts` - Database service (no changes, already working)
