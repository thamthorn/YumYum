# Mock Payment System - Usage Guide

## Overview

The mock payment system simulates payment processing but creates **real database records** for testing the financial flow without a real payment gateway.

## What You Have Now

### ✅ Backend Endpoints

1. **POST /api/orders/[id]/mock-payment**

   - Creates real payment records with status "completed"
   - Creates escrow records with status "held" (if escrow enabled)
   - Updates order status automatically
   - Generates mock transaction IDs like `mock_1730630400000_abc123`

2. **POST /api/orders/[id]/release-escrow**

   - Releases held escrow funds when order is completed
   - Makes money available for OEM withdrawal

3. **GET /api/oem/financials**

   - Returns OEM financial dashboard data
   - Shows: available balance, escrow balance, total earnings, pending withdrawals

4. **POST /api/oem/withdrawals**
   - Request withdrawal of available funds
   - GET /api/oem/withdrawals - List withdrawal history

### ✅ Frontend Components

- **PaymentModal**: Updated to use mock payment endpoint
- **OEMFinancialStats**: Displays 4 financial stat cards
- **OEM Dashboard**: Available at `/dashboard/oem`

### ✅ Database Schema

- `payments` table - All payment transactions
- `escrow` table - Escrow management
- `withdrawals` table - Withdrawal requests
- `oem_financials` view - Aggregated financial data

## Next Steps to Get It Working

### 1. Apply Database Migration

You need to apply the migration file to create the new tables:

**Option A: Using Supabase CLI (Recommended)**

```bash
cd YumYum
npx supabase db push
```

**Option B: Using Supabase Dashboard**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Open `supabase/migrations/20250203180000_add_payments_and_escrow.sql`
5. Copy entire content and paste in SQL Editor
6. Click "Run"

### 2. Regenerate TypeScript Types

After migration is applied, update TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

### 3. Test the Flow

Once migration is applied and types regenerated:

1. **Create an order** (as buyer)
2. **Pay deposit (30%)** → Click "Pay" button → PaymentModal opens → Confirm payment
   - Check: Payment record created in database
   - Check: Escrow record created with status "held"
   - Check: Order status changed to "manufacturing"
3. **Pay balance (70%)** → When order ready, pay remaining amount
   - Check: Second payment record created
   - Check: Second escrow record created
   - Check: Order status changed to "delivering"
4. **View OEM dashboard** → Go to `/dashboard/oem`
   - Should see: Money in Escrow (both deposits)
   - Should see: Available to Withdraw = 0 (still in escrow)
5. **Complete order** → Mark order as completed
   - Call release-escrow endpoint (or add UI button)
   - Check: Escrow status changed to "released"
   - Check: Money moved to available balance
6. **Check OEM dashboard again**
   - Should see: Available to Withdraw = total payments minus service fee
   - Should see: Money in Escrow = 0
   - Should see: Total Earnings = sum of all payments

## How Mock Payment Works

### Payment Flow

```
User clicks "Pay"
→ PaymentModal opens
→ User confirms payment method
→ POST /api/orders/[id]/mock-payment
→ Creates payment record (status: completed, gateway: mock)
→ Creates escrow record (status: held) if enabled
→ Updates order status
→ Returns success
→ UI shows success toast
```

### Database Changes

```sql
-- Payment record created
INSERT INTO payments (
  order_id,
  amount,
  currency,
  payment_type,
  payment_status,
  gateway_name,
  transaction_id
) VALUES (
  'order-123',
  10000,
  'THB',
  'deposit',
  'completed',
  'mock',
  'mock_1730630400000_abc123'
);

-- Escrow record created (if enabled)
INSERT INTO escrow (
  payment_id,
  order_id,
  oem_org_id,
  amount,
  currency,
  escrow_status
) VALUES (
  'payment-id',
  'order-123',
  'oem-org-id',
  10000,
  'THB',
  'held'
);
```

### Money Flow States

1. **Payment Made** → Money goes to escrow (status: held)
2. **Order Completed** → Escrow released (status: released)
3. **Money Available** → OEM can request withdrawal
4. **Withdrawal Requested** → Creates withdrawal record (status: pending)
5. **Withdrawal Processed** → Admin approves (status: completed)

## Testing Checklist

- [ ] Migration applied to Supabase
- [ ] TypeScript types regenerated
- [ ] Build succeeds with no errors
- [ ] Create test order
- [ ] Pay deposit via PaymentModal
- [ ] Verify payment in database
- [ ] Verify escrow in database
- [ ] Check order status updated
- [ ] Pay balance
- [ ] Verify second payment and escrow
- [ ] Complete order
- [ ] Release escrow (POST /api/orders/[id]/release-escrow)
- [ ] Check OEM dashboard shows available balance
- [ ] Request withdrawal
- [ ] Verify withdrawal record created

## Current Status

**Build Status**: ⚠️ Has TypeScript errors (expected until migration applied)

- Errors in: `app/api/orders/[id]/mock-payment/route.ts`
- Errors in: `app/api/orders/[id]/release-escrow/route.ts`
- Errors in: `app/api/oem/financials/route.ts`
- Reason: Database types don't include new tables yet
- Fix: Apply migration → Regenerate types → Errors disappear

**Functionality Status**: ✅ All code written and ready

- Mock payment endpoint: Ready
- Escrow release endpoint: Ready
- Financial dashboard API: Ready
- OEM dashboard UI: Ready
- Payment modal integration: ✅ Just completed

**Database Status**: ⏳ Waiting for migration

- Migration file: `supabase/migrations/20250203180000_add_payments_and_escrow.sql`
- Action needed: Apply migration to Supabase

## Routes Reference

- OEM Dashboard: `/dashboard/oem`
- Orders List: `/orders` (to create test orders)
- API Endpoints:
  - `POST /api/orders/[id]/mock-payment` - Make mock payment
  - `POST /api/orders/[id]/release-escrow` - Release escrow
  - `GET /api/oem/financials` - Get financial stats
  - `POST /api/oem/withdrawals` - Request withdrawal
  - `GET /api/oem/withdrawals` - List withdrawals

## Notes

- **Mock vs Real**: This is a mock payment gateway, but database changes are real
- **Service Fee**: 5% deducted automatically (calculated in financial view)
- **Escrow Protection**: Recommended for all transactions
- **Currency**: Supports any currency code (THB, USD, etc.)
- **Transaction IDs**: Format `mock_[timestamp]_[random]`

## Need Help?

1. **Migration issues**: Check Supabase dashboard logs
2. **Type errors**: Make sure migration is applied before regenerating types
3. **API errors**: Check browser console and network tab
4. **Database errors**: Check Supabase logs and RLS policies

---

**Last Updated**: February 3, 2025
**Status**: Ready for testing (pending migration)
