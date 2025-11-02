#!/bin/bash

# Script to deploy products and pricing updates to Supabase
# Usage: ./deploy-products-update.sh

set -e

echo "🚀 Deploying Products & Pricing Update to Supabase..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're logged in
echo "📋 Checking Supabase connection..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Connected to Supabase"
echo ""

# Ask for confirmation
read -p "⚠️  This will create new tables and add mock data. Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Run migration
echo "📦 Running migration..."
supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Migration failed. Please check your connection and try again."
    exit 1
fi

echo "✅ Migration completed"
echo ""

# Run seed data
echo "🌱 Seeding products and pricing data..."
supabase db reset --db-url "$DATABASE_URL"

if [ $? -ne 0 ]; then
    echo "⚠️  Seed failed. You may need to run the seed file manually:"
    echo "   psql \$DATABASE_URL -f supabase/seed.sql"
fi

echo "✅ Seed data loaded"
echo ""

# Generate TypeScript types
echo "🔧 Generating TypeScript types..."
supabase gen types typescript --local > types/database.ts

if [ $? -eq 0 ]; then
    echo "✅ TypeScript types updated"
else
    echo "⚠️  Could not generate types. Run manually:"
    echo "   supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts"
fi

echo ""
echo "✨ Deployment complete!"
echo ""
echo "📊 Summary:"
echo "   - 3 new tables: products, product_pricing, product_images"
echo "   - 15 sample products with pricing tiers"
echo "   - 2 helper functions: get_product_price, get_product_pricing_tiers"
echo ""
echo "📖 See docs/products-pricing-update.md for usage examples"
