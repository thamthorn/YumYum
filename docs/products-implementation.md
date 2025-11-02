# Products & Pricing Implementation

## Overview

This implementation adds support for OEM products with tiered pricing based on order quantity (economy of scale).

## What Was Added

### 1. Database Migration

**File:** `supabase/migrations/20250205000000_add_products_and_pricing.sql`

Creates three new tables:

- `products` - Product catalog for each OEM
- `product_pricing` - Quantity-based pricing tiers
- `product_images` - Multiple images per product

### 2. TypeScript Types

**File:** `types/database.ts`

Added TypeScript definitions for:

- `products` table (Row, Insert, Update)
- `product_pricing` table (Row, Insert, Update)
- `product_images` table (Row, Insert, Update)
- Helper functions: `get_product_price()`, `get_product_pricing_tiers()`

## Database Schema

### products

One OEM can have many products.

| Column                     | Type        | Description                  |
| -------------------------- | ----------- | ---------------------------- |
| `id`                       | uuid        | Primary key                  |
| `oem_org_id`               | uuid        | Foreign key to oem_profiles  |
| `name`                     | text        | Product name                 |
| `description`              | text        | Product description          |
| `category`                 | text        | Product category             |
| `sku`                      | text        | Stock keeping unit           |
| `image_url`                | text        | Main product image           |
| `specifications`           | jsonb       | Technical specifications     |
| `lead_time_days`           | integer     | Production lead time         |
| `moq`                      | integer     | Minimum order quantity       |
| `is_active`                | boolean     | Whether product is available |
| `created_at`, `updated_at` | timestamptz | Timestamps                   |

### product_pricing

One product can have many pricing tiers (quantity-based pricing).

| Column                     | Type          | Description                         |
| -------------------------- | ------------- | ----------------------------------- |
| `id`                       | uuid          | Primary key                         |
| `product_id`               | uuid          | Foreign key to products             |
| `min_quantity`             | integer       | Minimum quantity for this price     |
| `max_quantity`             | integer       | Maximum quantity (null = unlimited) |
| `unit_price`               | numeric(10,2) | Price per unit                      |
| `currency`                 | text          | Currency code (default: USD)        |
| `created_at`, `updated_at` | timestamptz   | Timestamps                          |

**Example Pricing:**

```
Product: Premium Cotton T-Shirt
- 500-999 units: $8.50 each
- 1,000-2,499 units: $7.80 each
- 2,500-4,999 units: $7.20 each
- 5,000+ units: $6.50 each
```

### product_images

Multiple images for each product.

| Column          | Type        | Description                |
| --------------- | ----------- | -------------------------- |
| `id`            | uuid        | Primary key                |
| `product_id`    | uuid        | Foreign key to products    |
| `image_url`     | text        | Image URL                  |
| `alt_text`      | text        | Alt text for accessibility |
| `display_order` | integer     | Display order              |
| `is_primary`    | boolean     | Primary product image      |
| `created_at`    | timestamptz | Timestamp                  |

## Row Level Security (RLS)

All three tables have RLS enabled with the following policies:

### Public Access

- Can view **active** products and their pricing/images
- Cannot modify any data

### OEM Members

- Can view and manage their own products
- Can add/edit/delete pricing tiers for their products
- Can manage product images

## Helper Functions

### `get_product_price(product_id, quantity)`

Returns the unit price for a specific quantity.

```typescript
const { data: price } = await supabase.rpc("get_product_price", {
  p_product_id: productId,
  p_quantity: 1500,
});
```

### `get_product_pricing_tiers(product_id)`

Returns all pricing tiers for a product.

```typescript
const { data: tiers } = await supabase.rpc("get_product_pricing_tiers", {
  p_product_id: productId,
});
```

## Usage Examples

### Query Products with Pricing

```typescript
// Get all products for an OEM with their pricing tiers
const { data: products } = await supabase
  .from("products")
  .select(
    `
    *,
    product_pricing (
      min_quantity,
      max_quantity,
      unit_price,
      currency
    )
  `
  )
  .eq("oem_org_id", oemId)
  .eq("is_active", true)
  .order("name");

// Get specific product with images
const { data: product } = await supabase
  .from("products")
  .select(
    `
    *,
    product_pricing (*),
    product_images (*)
  `
  )
  .eq("id", productId)
  .single();
```

### Insert New Product with Pricing

```typescript
// 1. Insert product
const { data: product } = await supabase
  .from("products")
  .insert({
    oem_org_id: oemId,
    name: "My New Product",
    description: "Product description",
    category: "Apparel",
    sku: "SKU-001",
    moq: 500,
    lead_time_days: 30,
    specifications: {
      material: "100% Cotton",
      weight: "200 GSM",
    },
  })
  .select()
  .single();

// 2. Insert pricing tiers
const { data: pricing } = await supabase.from("product_pricing").insert([
  {
    product_id: product.id,
    min_quantity: 500,
    max_quantity: 999,
    unit_price: 10.0,
  },
  {
    product_id: product.id,
    min_quantity: 1000,
    max_quantity: 2499,
    unit_price: 9.0,
  },
  {
    product_id: product.id,
    min_quantity: 2500,
    max_quantity: null,
    unit_price: 8.0,
  },
]);
```

## Next Steps

### To Deploy to Supabase:

1. **Run the migration:**

```bash
npx supabase db push
```

Or manually via SQL editor in Supabase dashboard.

2. **Verify tables exist:**

```sql
SELECT * FROM products LIMIT 1;
SELECT * FROM product_pricing LIMIT 1;
SELECT * FROM product_images LIMIT 1;
```

### To Add Sample Data:

You can use the seed data from `yumyum-products/supabase/seed.sql` (lines 956+) or create your own test products.

### Frontend Implementation Ideas:

1. **Product Catalog Page** (`/oems/[id]/products`)

   - Display all OEM products
   - Show pricing tiers in a table
   - Product image gallery
   - Specifications display

2. **OEM Dashboard - Product Management** (`/dashboard/oem/products`)

   - Add/edit products
   - Manage pricing tiers
   - Upload product images
   - Toggle product active status

3. **Price Calculator Component**

   - Input quantity
   - Show real-time unit price calculation
   - Display total cost
   - Compare pricing tiers

4. **Enhanced Request Form**
   - Browse OEM products
   - Select specific products for RFQ
   - Auto-calculate pricing based on quantity

## Database Diagram

```
organizations (OEM)
    ↓ (1:many)
oem_profiles
    ↓ (1:many)
products
    ↓ (1:many)           ↓ (1:many)
product_pricing    product_images
```

## Notes

- Migration file copied from `yumyum-products` implementation
- TypeScript types manually added to `types/database.ts`
- All prices stored in USD by default (configurable per tier)
- Pricing uses `numeric(10, 2)` for precision
- Specifications stored as JSONB for flexibility
- RLS ensures data security and proper access control
- Your friend's database already has product data from their implementation

## Migration Status

✅ Database migration file created  
✅ TypeScript types added  
⏳ Frontend UI components (to be implemented as needed)  
⏳ Sample data seeding (optional - data may already exist)

---

**Source:** Implementation merged from `yumyum-products` folder  
**Date:** 2025-02-05
