# Cancel Order API Implementation

## Overview

Implemented a fully functional cancel order API endpoint and integrated it with the order details page UI.

## What Was Added

### 1. **Cancel Order API Endpoint**

Created: `app/api/orders/[id]/cancel/route.ts`

**Features:**

- ✅ POST endpoint for cancelling orders
- ✅ Authentication check (user must be logged in)
- ✅ Order existence validation
- ✅ Status validation (prevents cancelling completed/delivered orders)
- ✅ Database update to set status to "cancelled"
- ✅ Creates order event for audit trail
- ✅ Proper error handling with AppError class
- ✅ Descriptive error messages

**Endpoint Details:**

```
POST /api/orders/[id]/cancel
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    /* updated order object */
  }
}
```

**Response (Error):**

```json
{
  "error": "Error message"
}
```

**Status Codes:**

- 200: Success
- 400: Cannot cancel (invalid status)
- 401: Unauthorized (not logged in)
- 404: Order not found
- 500: Internal server error

### 2. **Non-Cancellable Statuses**

Orders cannot be cancelled if they are in these statuses:

- `cancelled` (already cancelled)
- `completed` (order finished)
- `delivered` (already delivered)
- `in_transit` (in shipping)
- `delivering` (in delivery process)

### 3. **Order Events Tracking**

When an order is cancelled, the system:

- Updates the order status to "cancelled"
- Creates an order event with:
  - `event_type`: "status_change"
  - `stage`: "cancelled"
  - `created_at`: Current timestamp

### 4. **Frontend Integration**

**Enhanced Order Details Page:**

- Integrated cancel API with actual HTTP call
- Added toast notifications for success/error feedback
- Implemented query invalidation for automatic UI refresh
- Added redirect to dashboard after successful cancellation
- Improved error handling with user-friendly messages

**User Flow:**

1. User clicks "Cancel Order" button (only visible for cancellable orders)
2. Confirmation dialog appears with warning
3. User confirms cancellation
4. API request sent with loading state
5. Success: Toast notification + redirect to dashboard
6. Error: Toast notification with error message + dialog stays open

**Toast Notifications:**

- **Success**: "Order Cancelled - Your order has been cancelled successfully."
- **Error**: Shows specific error message from API

### 5. **React Query Integration**

Uses React Query for optimal state management:

- `useQueryClient()` - Access to query client
- `queryClient.invalidateQueries()` - Refresh order data after cancellation
- Invalidates both single order and orders list queries
- Ensures dashboard shows updated status immediately

## Technical Implementation

### API Route Structure

```typescript
POST /api/orders/[id]/cancel
├── Authentication check
├── Fetch order from database
├── Validate order status
├── Update order status to cancelled
├── Create order event
└── Return success response
```

### Frontend Handler

```typescript
const handleCancelOrder = async () => {
  1. Show loading state
  2. Send POST request to /api/orders/[id]/cancel
  3. Handle response:
     - Success: Show toast, invalidate queries, redirect
     - Error: Show error toast, keep dialog open
  4. Hide loading state
}
```

### Database Changes

**orders table:**

- `status` updated to "cancelled"
- `updated_at` set to current timestamp

**order_events table:**

- New record created with cancellation details

## Security & Validation

### Authentication

- ✅ Requires authenticated user session
- ✅ Uses Supabase auth check

### Authorization

- ✅ Verifies order exists
- ✅ Status-based permission (cannot cancel certain statuses)

### Data Validation

- ✅ Valid order ID required
- ✅ Order must exist in database
- ✅ Current status must allow cancellation

## Error Handling

### API Errors

- 401: User not logged in
- 404: Order not found
- 400: Invalid status for cancellation
- 500: Database or server error

### Frontend Errors

- Network errors: Shows "An error occurred" toast
- API errors: Shows specific error message from response
- All errors: Logs to console for debugging

## User Experience

### Before Cancellation

- Cancel button only shows for eligible orders
- Red destructive styling indicates danger action
- Clear icon (X) indicates removal

### During Cancellation

- Modal dialog with warning message
- "Keep Order" button to abort
- "Cancel Order" button with loading spinner
- Button disabled during API call
- Clear consequences explained

### After Cancellation

- Success toast appears
- Dialog closes
- Brief delay (1.5s) before redirect
- Redirects to dashboard
- Order appears in "History" tab as cancelled

## Files Modified/Created

### Created

- `app/api/orders/[id]/cancel/route.ts` - Cancel order API endpoint

### Modified

- `app/orders/[id]/page.tsx` - Integrated API and improved UX
  - Added `useQueryClient` import
  - Added `useToast` hook
  - Updated `handleCancelOrder` with API call
  - Added query invalidation
  - Added toast notifications

## Testing Checklist

- [x] API endpoint compiles without errors
- [x] Frontend page compiles without errors
- [x] TypeScript types are correct
- [x] Toast notifications imported
- [x] Query client integrated
- [ ] Test cancel flow with real order (needs testing environment)
- [ ] Test error cases (needs testing environment)
- [ ] Verify order event created in database
- [ ] Verify order appears in History tab after cancel
- [ ] Test redirect to dashboard works
- [ ] Test toast notifications appear correctly

## Future Enhancements

1. **Email Notifications**: Send email to buyer and OEM when order is cancelled
2. **Cancellation Reason**: Add optional text field for cancellation reason
3. **Refund Processing**: Integrate with payment system for automatic refunds
4. **OEM Notification**: Real-time notification to OEM via websocket
5. **Analytics**: Track cancellation rates and reasons
6. **Undo Feature**: Allow undo within short time window
7. **Partial Cancellation**: Allow cancelling individual line items
8. **Cancellation Fee**: Calculate and display any applicable fees

## Related Features

- **Order Details Page**: `/orders/[id]` - Shows order with cancel button
- **Buyer Dashboard**: `/dashboard/buyer` - History tab shows cancelled orders
- **Order Events**: Audit trail of all order status changes
- **Admin Create Order**: `/admin-create-order` - Can create orders in any status

## API Documentation

### Cancel Order

**Endpoint:** `POST /api/orders/{orderId}/cancel`

**Headers:**

```
Authorization: Bearer {supabase_session_token}
Content-Type: application/json
```

**Path Parameters:**

- `orderId` (string, required): UUID of the order to cancel

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "id": "uuid",
    "status": "cancelled",
    "updated_at": "2024-11-02T..."
    // ... other order fields
  }
}
```

**Error Responses:**

401 Unauthorized:

```json
{ "error": "Unauthorized" }
```

404 Not Found:

```json
{ "error": "Order not found" }
```

400 Bad Request:

```json
{ "error": "Cannot cancel order with status: delivered" }
```

500 Internal Server Error:

```json
{ "error": "Failed to cancel order" }
```

## Notes

- Cancel feature only available for orders in early stages
- Once cancelled, order status cannot be reversed
- Cancellation creates permanent audit trail in order_events
- Dashboard automatically updates after cancellation
- Toast notifications provide immediate user feedback
