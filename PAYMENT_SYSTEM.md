# Payment & Escrow System Documentation

## Overview

The YumYum platform now includes a complete payment and escrow system that tracks financial transactions between buyers and OEMs. This enables OEMs to:

- View their total earnings
- Monitor money held in escrow
- See available balance for withdrawal
- Request withdrawals to their bank account

## Database Schema

### New Tables

#### 1. `payments`

Tracks all payment transactions between buyers and OEMs.

**Key Fields:**

- `order_id`: References the order this payment is for
- `buyer_org_id`, `oem_org_id`: The parties involved
- `amount`, `currency`: Payment amount and currency
- `payment_type`: `deposit`, `balance`, `full_payment`, `milestone`, or `refund`
- `payment_method`: How the payment was made (credit_card, bank_transfer, etc.)
- `status`: `pending`, `processing`, `completed`, `failed`, `refunded`, or `cancelled`
- `gateway_transaction_id`: External payment gateway reference
- `paid_at`: When payment was completed

#### 2. `escrow`

Manages held funds for orders until delivery conditions are met.

**Key Fields:**

- `order_id`: The order this escrow is for
- `amount`, `currency`: Escrow amount
- `status`: `pending`, `held`, `released`, `refunded`, or `disputed`
- `release_conditions`: JSON defining when funds should be released
- `auto_release_date`: Automatic release date if conditions met
- `released_at`: When funds were released to OEM
- `held_at`: When funds were placed in escrow

#### 3. `withdrawals`

Tracks OEM withdrawal requests and their processing.

**Key Fields:**

- `oem_org_id`: The OEM requesting withdrawal
- `amount`, `currency`: Withdrawal amount
- `status`: `pending`, `processing`, `completed`, `failed`, or `cancelled`
- `bank_name`, `account_number`, `account_holder_name`: Bank details
- `requested_at`, `processed_at`: Timing information
- `failure_reason`: If withdrawal failed

### Views

#### `oem_financials`

Aggregated view providing real-time financial dashboard data for each OEM.

**Calculated Fields:**

- `total_earnings`: Sum of all completed payments
- `escrow_balance`: Money currently held in escrow
- `released_balance`: Money released from escrow (available for withdrawal)
- `total_withdrawn`: Total amount already withdrawn
- `pending_withdrawals`: Amount in pending/processing withdrawals
- `available_balance`: Money available to withdraw (released - withdrawn - pending)
- `total_transactions`: Count of completed payment transactions
- `active_escrows`: Count of currently held escrows

## API Endpoints

### GET `/api/oem/financials`

Returns financial dashboard data for the logged-in OEM.

**Response:**

```json
{
  "data": {
    "totalEarnings": "150000.00",
    "escrowBalance": "50000.00",
    "releasedBalance": "100000.00",
    "totalWithdrawn": "80000.00",
    "pendingWithdrawals": "0.00",
    "availableBalance": "20000.00",
    "totalTransactions": 15,
    "activeEscrows": 3,
    "lastTransactionAt": "2025-11-02T10:30:00Z",
    "currency": "THB",
    "recentPayments": [...],
    "activeEscrowsList": [...],
    "recentWithdrawals": [...]
  }
}
```

### POST `/api/oem/withdrawals`

Creates a new withdrawal request.

**Request:**

```json
{
  "amount": 10000.0,
  "bankName": "Bangkok Bank",
  "accountNumber": "1234567890",
  "accountHolderName": "ABC Manufacturing Co., Ltd.",
  "notes": "Monthly withdrawal"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully",
  "data": {
    "id": "uuid",
    "amount": 10000.0,
    "currency": "THB",
    "status": "pending"
  }
}
```

### GET `/api/oem/withdrawals`

Returns all withdrawal requests for the OEM.

### POST `/api/orders/[id]/payment`

Processes a payment for an order (existing endpoint updated).

**Current Behavior:**

- Updates order status based on payment type
- Does NOT create payment records yet (TODO)

**TODO for Production:**

- Integrate with real payment gateway (Stripe/PayPal)
- Create payment record in `payments` table
- Create escrow record if `add_escrow` is true
- Send confirmation emails

## UI Components

### `OEMFinancialStats` Component

Displays financial overview on OEM dashboard with:

- Available to Withdraw amount (green)
- Money in Escrow amount (amber)
- Total Earnings (blue)
- Pending Withdrawals (purple)
- Request Withdrawal button (when balance > 0)

**Location:** `/components/OEMFinancialStats.tsx`

## Payment Flow

### Standard Order Payment Flow

1. **Order Created** (`status: 'signed'`)

   - No payment yet

2. **Deposit Payment** (if required)

   - Buyer pays deposit (e.g., 30% of total)
   - Payment record created with `type: 'deposit'`, `status: 'completed'`
   - If escrow enabled: Create escrow record with `status: 'held'`
   - Order status → `manufacturing`

3. **Balance Payment**

   - Buyer pays remaining balance
   - Payment record created with `type: 'balance'`, `status: 'completed'`
   - If escrow: Add to existing escrow
   - Order status → `delivering`

4. **Order Delivered & Completed**

   - Order status → `completed`
   - Escrow status → `released`
   - Money becomes available for OEM withdrawal

5. **OEM Requests Withdrawal**
   - OEM submits withdrawal request
   - Admin processes withdrawal
   - Withdrawal status → `completed`
   - Amount deducted from available balance

## SQL Helper Functions

### `get_oem_available_balance(p_oem_org_id uuid)`

Returns the available balance for an OEM organization.

### `create_withdrawal_request(...)`

Creates a new withdrawal request with all necessary fields.

### `get_oem_withdrawals(p_oem_org_id uuid)`

Returns all withdrawal requests for an OEM.

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies:

- **payments**: Users can view payments for their organization (buyer or OEM)
- **escrow**: Users can view escrow for their organization
- **withdrawals**: OEMs can view and create their own withdrawals

### Data Protection

- Sensitive bank details should be encrypted in production
- Use environment variables for payment gateway credentials
- Implement proper audit logging for financial transactions

## Migration

**File:** `/supabase/migrations/20250203180000_add_payments_and_escrow.sql`

To apply:

```bash
# Using Supabase CLI
supabase db push

# Or via Supabase Dashboard
# Copy the SQL and run in SQL Editor
```

## TODO for Production

1. **Payment Gateway Integration**

   - [ ] Set up Stripe/PayPal/Omise accounts
   - [ ] Implement webhook handlers for payment confirmations
   - [ ] Add payment gateway credentials to environment
   - [ ] Create payment records when payments are processed
   - [ ] Handle payment failures and refunds

2. **Escrow Automation**

   - [ ] Auto-create escrow when `add_escrow` is true on request
   - [ ] Implement auto-release logic based on conditions
   - [ ] Handle disputes and manual release
   - [ ] Add escrow release notifications

3. **Withdrawal Processing**

   - [ ] Implement admin panel for processing withdrawals
   - [ ] Integrate with bank transfer APIs
   - [ ] Add withdrawal fee calculations (if applicable)
   - [ ] Send withdrawal confirmation emails
   - [ ] Implement withdrawal limits and verification

4. **Security Enhancements**

   - [ ] Encrypt sensitive bank account data
   - [ ] Add 2FA for withdrawal requests
   - [ ] Implement withdrawal approval workflows
   - [ ] Add fraud detection and monitoring

5. **Reporting & Analytics**

   - [ ] Financial reports for OEMs
   - [ ] Transaction history export
   - [ ] Tax documentation generation
   - [ ] Revenue analytics dashboard

6. **TypeScript Types**
   - [ ] Regenerate database types after migration
   - [ ] Remove @ts-ignore comments
   - [ ] Add proper typing for API responses

## Testing

### Manual Testing Steps

1. **Create Test Payment:**

```sql
INSERT INTO payments (order_id, buyer_org_id, oem_org_id, amount, payment_type, status, paid_at)
VALUES ('order-uuid', 'buyer-org-uuid', 'oem-org-uuid', 10000.00, 'deposit', 'completed', now());
```

2. **Create Test Escrow:**

```sql
INSERT INTO escrow (order_id, buyer_org_id, oem_org_id, amount, status, held_at)
VALUES ('order-uuid', 'buyer-org-uuid', 'oem-org-uuid', 10000.00, 'held', now());
```

3. **Release Escrow:**

```sql
UPDATE escrow SET status = 'released', released_at = now() WHERE id = 'escrow-uuid';
```

4. **Test Withdrawal Request:**

- Login as OEM user
- Navigate to OEM Dashboard
- Click "Request Withdrawal"
- Fill in bank details
- Submit request

## Support & Maintenance

- Database views are automatically updated when underlying data changes
- Monitor `oem_financials` view performance with large datasets
- Consider partitioning `payments` table by date for scalability
- Set up alerts for failed payments or stuck withdrawals
- Regular audit of escrow releases vs. actual transfers

## Questions?

Contact the development team or refer to the main documentation in `/docs`.
