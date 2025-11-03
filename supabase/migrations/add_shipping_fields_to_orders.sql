-- Add shipping fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_preference TEXT CHECK (shipping_preference IN ('oem-location', 'buyer-address')),
ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- Add comment for documentation
COMMENT ON COLUMN orders.shipping_preference IS 'Shipping preference selected during balance payment: oem-location or buyer-address';
COMMENT ON COLUMN orders.shipping_address IS 'Delivery address if shipping_preference is buyer-address';
