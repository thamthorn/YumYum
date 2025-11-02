# Products & Pricing Database Update

## Overview
This update adds support for OEM products with tiered pricing based on order quantity (economy of scale).

## Database Changes

### New Tables

#### 1. `products`
One OEM can have many products.

**Columns:**
- `id` (uuid) - Primary key
- `oem_org_id` (uuid) - Foreign key to oem_profiles
- `name` (text) - Product name
- `description` (text) - Product description
- `category` (text) - Product category
- `sku` (text) - Stock keeping unit
- `image_url` (text) - Main product image
- `specifications` (jsonb) - Technical specifications (material, dimensions, etc.)
- `lead_time_days` (integer) - Production lead time
- `moq` (integer) - Minimum order quantity
- `is_active` (boolean) - Whether product is available
- `created_at`, `updated_at` (timestamptz)

#### 2. `product_pricing`
One product can have many pricing tiers (quantity-based pricing).

**Columns:**
- `id` (uuid) - Primary key
- `product_id` (uuid) - Foreign key to products
- `min_quantity` (integer) - Minimum quantity for this price
- `max_quantity` (integer) - Maximum quantity (null = unlimited)
- `unit_price` (numeric) - Price per unit
- `currency` (text) - Currency code (default: USD)
- `created_at`, `updated_at` (timestamptz)

**Example Pricing Structure:**
```
Product: Premium Cotton T-Shirt
- 500-999 units: $8.50 each
- 1,000-2,499 units: $7.80 each
- 2,500-4,999 units: $7.20 each
- 5,000+ units: $6.50 each
```

#### 3. `product_images`
Multiple images for each product.

**Columns:**
- `id` (uuid) - Primary key
- `product_id` (uuid) - Foreign key to products
- `image_url` (text) - Image URL
- `alt_text` (text) - Alt text for accessibility
- `display_order` (integer) - Display order
- `is_primary` (boolean) - Primary product image
- `created_at` (timestamptz)

### Helper Functions

#### `get_product_price(product_id, quantity)`
Returns the unit price for a specific quantity.

```sql
SELECT get_product_price('product-uuid', 1000);
-- Returns: 7.80
```

#### `get_product_pricing_tiers(product_id)`
Returns all pricing tiers for a product.

```sql
SELECT * FROM get_product_pricing_tiers('product-uuid');
-- Returns table with all pricing tiers
```

## Mock Data Summary

### Products Added (15 products across 10 OEMs)

#### Fashion (Premium Fashion Co. & Artisan Textiles)
1. Premium Cotton T-Shirt - MOQ: 500, Lead time: 30 days
2. Eco-Friendly Tote Bag - MOQ: 1,000, Lead time: 25 days
3. Silk Scarf Collection - MOQ: 200, Lead time: 45 days
4. Hand-Woven Cushion Cover - MOQ: 100, Lead time: 35 days
5. Custom Embroidered Denim Jacket - MOQ: 150, Lead time: 40 days

#### F&B (Thai Snacks Factory & Organic Beverages)
6. Coconut Chips - Original Flavor - MOQ: 5,000, Lead time: 20 days
7. Mango Sticky Rice Snack Bar - MOQ: 10,000, Lead time: 25 days
8. Cold-Pressed Green Juice - MOQ: 500, Lead time: 15 days
9. Herbal Tea Sachets - Lemongrass - MOQ: 2,000, Lead time: 30 days

#### Cosmetics (Natural Beauty Labs & Green Cosmetics)
10. Vitamin C Serum - MOQ: 500, Lead time: 35 days
11. Hyaluronic Acid Moisturizer - MOQ: 1,000, Lead time: 30 days
12. Luxury Rose Face Cream - MOQ: 300, Lead time: 45 days

#### Packaging (EcoPack Solutions & Premium Packaging)
13. Compostable Food Container - MOQ: 10,000, Lead time: 20 days
14. Kraft Paper Mailer Box - MOQ: 5,000, Lead time: 25 days
15. Luxury Gift Box with Magnetic Closure - MOQ: 1,000, Lead time: 35 days

### Pricing Tiers
Each product has 3-4 pricing tiers demonstrating economy of scale:
- Lower quantities = higher unit price
- Higher quantities = lower unit price
- Savings range from 15-40% depending on volume

## Deployment Steps

### 1. Run Migration
```bash
# From Supabase dashboard or CLI
psql -h your-supabase-db.supabase.co -U postgres -d postgres -f supabase/migrations/20250205000000_add_products_and_pricing.sql
```

Or using Supabase CLI:
```bash
supabase db push
```

### 2. Seed Data
```bash
# Run seed file to populate products and pricing
psql -h your-supabase-db.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

Or using Supabase CLI:
```bash
supabase db reset
```

### 3. Regenerate TypeScript Types
```bash
# Generate types from Supabase
npx supabase gen types typescript --project-id your-project-id > types/database.ts

# Or if using local development
npx supabase gen types typescript --local > types/database.ts
```

## Usage Examples

### Query Products with Pricing

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabase = createClient<Database>(url, key);

// Get all products for an OEM with their pricing tiers
const { data: products } = await supabase
  .from('products')
  .select(`
    *,
    product_pricing (
      min_quantity,
      max_quantity,
      unit_price,
      currency
    )
  `)
  .eq('oem_org_id', oemId)
  .eq('is_active', true)
  .order('name');

// Get specific product with images
const { data: product } = await supabase
  .from('products')
  .select(`
    *,
    product_pricing (*),
    product_images (*)
  `)
  .eq('id', productId)
  .single();

// Calculate price for specific quantity
const { data: price } = await supabase
  .rpc('get_product_price', {
    p_product_id: productId,
    p_quantity: 1500
  });
```

### Insert New Product with Pricing

```typescript
// 1. Insert product
const { data: product } = await supabase
  .from('products')
  .insert({
    oem_org_id: oemId,
    name: 'My New Product',
    description: 'Product description',
    category: 'Apparel',
    sku: 'SKU-001',
    moq: 500,
    lead_time_days: 30,
    specifications: {
      material: '100% Cotton',
      weight: '200 GSM'
    }
  })
  .select()
  .single();

// 2. Insert pricing tiers
const { data: pricing } = await supabase
  .from('product_pricing')
  .insert([
    { product_id: product.id, min_quantity: 500, max_quantity: 999, unit_price: 10.00 },
    { product_id: product.id, min_quantity: 1000, max_quantity: 2499, unit_price: 9.00 },
    { product_id: product.id, min_quantity: 2500, max_quantity: null, unit_price: 8.00 }
  ]);
```

## Row Level Security (RLS)

### Products
- **Public:** Can view active products
- **OEM Members:** Can manage their own products

### Product Pricing
- **Public:** Can view pricing for active products
- **OEM Members:** Can manage their own product pricing

### Product Images
- **Public:** Can view images for active products
- **OEM Members:** Can manage their own product images

## Frontend Integration Ideas

### 1. Product Catalog Page
Display all OEM products with:
- Product image gallery
- Pricing tiers table
- MOQ and lead time info
- Specifications

### 2. Price Calculator
Interactive tool where buyers can:
- Input desired quantity
- See real-time unit price
- Calculate total cost
- Compare pricing tiers

### 3. OEM Dashboard
For OEMs to manage:
- Add/edit products
- Set pricing tiers
- Upload product images
- Track product views/inquiries

### 4. Buyer Request Form
Enhanced request flow:
- Browse OEM products
- Select specific products
- Auto-calculate pricing
- Include in RFQ

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

- All prices are stored in USD by default (configurable per tier)
- Pricing uses `numeric(10, 2)` for precision (up to 99,999,999.99)
- Specifications stored as JSONB for flexibility
- Helper functions use SQL for better performance
- RLS ensures OEMs can only manage their own products
- Public can view active products only

## Next Steps

1. **Deploy migration and seed data** to Supabase
2. **Regenerate TypeScript types** after migration
3. **Update frontend** to display products and pricing
4. **Add product management UI** for OEMs
5. **Enhance request forms** to include product selection
6. **Add analytics** to track product views and conversions
