# Admin Order Creation Guide

## Overview

This is a hidden admin route that allows you to create real orders from existing requests for testing purposes.

## Access

Navigate to: `http://localhost:3000/admin-create-order`

## How to Use

### Step 1: Select a Request

1. The page will load all existing requests from the database
2. Select a request from the dropdown that shows:

   - Request title
   - OEM name
   - Request status

3. Once selected, you'll see the request details:
   - OEM organization
   - Product description
   - Quantity range
   - Timeline

### Step 2: Choose Order Status

Select the initial status for the order:

- **Signed**: Order contract has been signed
- **Preparation**: Preparing for production
- **Manufacturing**: Currently in production
- **Delivering**: Being shipped to buyer
- **Completed**: Order completed and delivered
- **Cancelled**: Order cancelled

### Step 3: Add Order Line Items

1. Click "Add Item" to add more line items
2. For each line item, fill in:

   - **Description**: Product description (e.g., "Custom T-Shirt - Premium Cotton")
   - **Quantity**: Number of units
   - **Unit**: Unit type (e.g., "pieces", "kg", "boxes")
   - **Unit Price**: Price per unit in THB

3. The subtotal for each item is calculated automatically
4. Remove items using the trash icon if needed

### Step 4: Review Total

The total order value is calculated automatically from all line items

### Step 5: Create Order

Click "Create Order" to submit

## What Happens When You Create an Order

1. **Order Record**: Creates a new order in the `orders` table with:

   - Buyer organization ID (from the request)
   - OEM organization ID (from the request)
   - Request ID (links back to the original request)
   - Status, total value, currency, quantity

2. **Line Items**: Creates records in `order_line_items` table for each item

3. **Order Event**: Creates an initial event in `order_events` table to track the order creation

4. **Dashboard Update**: The order will immediately appear in:
   - Buyer dashboard (Orders tab)
   - Matches tab (View Order button)
   - Order detail page

## Example Workflow

1. Create a match using AI Search or manual onboarding
2. Use `/admin-test-matches` to approve the match (change from "new_match" to "contacted")
3. The match appears in Dashboard → Matches tab
4. Use `/admin-create-order` to create an order for that request
5. "View Order" button appears in the Matches tab
6. Click "View Order" to see the order details

## Important Notes

- ⚠️ This is a **testing tool only** - remove before production
- The request must have an assigned OEM to create an order
- All prices are in THB (Thai Baht)
- Order statuses match the database enum: signed, preparation, manufacturing, delivering, completed, cancelled
- Created orders are **real database records**, not mock data

## Cleanup

Before deploying to production:

1. Delete `/app/admin-create-order/page.tsx`
2. Delete `/app/api/admin-create-order/route.ts`
3. Delete this guide file
