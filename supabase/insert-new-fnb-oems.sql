-- Insert 3 new F&B OEMs with 2 products each
-- Run this in Supabase SQL Editor

-- ========================================
-- 1. INSERT ORGANIZATIONS (3 new F&B OEMs)
-- ========================================
INSERT INTO public.organizations (
  id,
  type,
  display_name,
  industry,
  location,
  description,
  website,
  slug,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000023',
    'oem',
    'Thai Spice Masters',
    'F&B',
    'Ayutthaya, Thailand',
    'Authentic Thai seasoning and sauce manufacturing with traditional recipes.',
    NULL,
    'thai-spice-masters',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000024',
    'oem',
    'Tropical Beverages Co.',
    'F&B',
    'Rayong, Thailand',
    'Fruit juice and beverage manufacturing using fresh tropical fruits.',
    NULL,
    'tropical-beverages-co',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000025',
    'oem',
    'Healthy Bites Factory',
    'F&B',
    'Chiang Rai, Thailand',
    'Health-focused snack production with superfood ingredients.',
    NULL,
    'healthy-bites-factory',
    timezone('utc', now()),
    timezone('utc', now())
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  industry = EXCLUDED.industry,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  slug = EXCLUDED.slug,
  updated_at = EXCLUDED.updated_at;

-- ========================================
-- 2. INSERT OEM PROFILES
-- ========================================
INSERT INTO public.oem_profiles (
  organization_id,
  scale,
  moq_min,
  moq_max,
  lead_time_days,
  response_time_hours,
  prototype_support,
  short_description,
  cross_border,
  rating,
  total_reviews,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000023',
    'small',
    300,
    10000,
    20,
    12,
    true,
    'Traditional Thai seasonings and sauces with authentic flavors.',
    true,
    4.6,
    38,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000024',
    'medium',
    1000,
    50000,
    25,
    24,
    true,
    'Fresh tropical fruit beverages with premium quality ingredients.',
    true,
    4.7,
    67,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000025',
    'small',
    500,
    15000,
    30,
    18,
    true,
    'Nutritious snacks made with superfoods and natural ingredients.',
    true,
    4.5,
    29,
    timezone('utc', now()),
    timezone('utc', now())
  )
ON CONFLICT (organization_id) DO UPDATE SET
  scale = EXCLUDED.scale,
  moq_min = EXCLUDED.moq_min,
  moq_max = EXCLUDED.moq_max,
  lead_time_days = EXCLUDED.lead_time_days,
  response_time_hours = EXCLUDED.response_time_hours,
  prototype_support = EXCLUDED.prototype_support,
  short_description = EXCLUDED.short_description,
  cross_border = EXCLUDED.cross_border,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews,
  updated_at = EXCLUDED.updated_at;

-- ========================================
-- 3. INSERT CERTIFICATIONS
-- ========================================
INSERT INTO public.oem_certifications (
  oem_org_id,
  certification_id,
  verified,
  verification_tier,
  verified_at,
  created_at
)
VALUES
  -- Thai Spice Masters certifications
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000206', true, 'trusted_partner', timezone('utc', now()), timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000202', true, 'verified', timezone('utc', now()), timezone('utc', now())),
  
  -- Tropical Beverages Co. certifications
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000206', true, 'certified', timezone('utc', now()), timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000213', true, 'verified', timezone('utc', now()), timezone('utc', now())),
  
  -- Healthy Bites Factory certifications
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000213', true, 'certified', timezone('utc', now()), timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000202', true, 'verified', timezone('utc', now()), timezone('utc', now()))
ON CONFLICT (oem_org_id, certification_id) DO UPDATE SET
  verified = EXCLUDED.verified,
  verification_tier = EXCLUDED.verification_tier,
  verified_at = EXCLUDED.verified_at;

-- ========================================
-- 4. INSERT OEM SERVICES
-- ========================================
INSERT INTO public.oem_services (oem_org_id, service_id, created_at)
VALUES
  -- Thai Spice Masters services
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000314', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000301', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000304', timezone('utc', now())),
  
  -- Tropical Beverages Co. services
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000314', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000301', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000303', timezone('utc', now())),
  
  -- Healthy Bites Factory services
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000314', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000301', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000313', timezone('utc', now()))
ON CONFLICT (oem_org_id, service_id) DO NOTHING;

-- ========================================
-- 5. INSERT OEM LANGUAGES
-- ========================================
INSERT INTO public.oem_languages (oem_org_id, language_code, proficiency, created_at)
VALUES
  -- Thai Spice Masters languages
  ('00000000-0000-0000-0000-000000000023', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000023', 'th', 'native', timezone('utc', now())),
  
  -- Tropical Beverages Co. languages
  ('00000000-0000-0000-0000-000000000024', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000024', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000024', 'zh', 'conversational', timezone('utc', now())),
  
  -- Healthy Bites Factory languages
  ('00000000-0000-0000-0000-000000000025', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000025', 'th', 'native', timezone('utc', now()))
ON CONFLICT (oem_org_id, language_code) DO UPDATE SET
  proficiency = EXCLUDED.proficiency;

-- ========================================
-- 6. INSERT PRODUCTS (6 new products - 2 per OEM)
-- ========================================
INSERT INTO public.products (
  id,
  oem_org_id,
  name,
  description,
  category,
  sku,
  image_url,
  specifications,
  lead_time_days,
  moq,
  is_active
)
VALUES
  -- Thai Spice Masters Products
  (
    '00000000-0000-0000-0000-000000000516',
    '00000000-0000-0000-0000-000000000023',
    'Tom Yum Paste - Authentic Recipe',
    'Traditional Thai Tom Yum paste with authentic herbs and spices. Ready-to-use for quick meal preparation.',
    'Condiments',
    'TSM-TYP-001',
    'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&fit=crop',
    '{"ingredients": "Lemongrass, Galangal, Kaffir Lime, Chili, Shrimp Paste", "weight_per_jar": "200g", "shelf_life": "18 months", "spice_level": "Medium-Hot", "usage": "Add 2 tbsp per 500ml soup", "certifications": ["GMP", "HACCP"]}'::jsonb,
    20,
    300,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000517',
    '00000000-0000-0000-0000-000000000023',
    'Green Curry Paste - Traditional Blend',
    'Authentic Thai green curry paste made with fresh green chilies and aromatic herbs. Restaurant-quality flavor.',
    'Condiments',
    'TSM-GCP-002',
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop',
    '{"ingredients": "Green Chili, Garlic, Lemongrass, Galangal, Coriander Root, Cumin", "weight_per_jar": "200g", "shelf_life": "18 months", "spice_level": "Hot", "usage": "Add 3 tbsp per 400ml coconut milk", "certifications": ["GMP", "Halal"]}'::jsonb,
    20,
    300,
    true
  ),

  -- Tropical Beverages Co. Products
  (
    '00000000-0000-0000-0000-000000000518',
    '00000000-0000-0000-0000-000000000024',
    'Fresh Mango Juice - 100% Pure',
    'Pure pressed mango juice from premium Thai mangoes. No added sugar or preservatives.',
    'Beverages',
    'TBC-MJ-001',
    'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop',
    '{"ingredients": "100% Mango", "volume_per_bottle": "300ml", "shelf_life": "12 months (unopened)", "packaging": "Glass bottle or Tetra Pak", "brix_level": "14-16", "certifications": ["Organic", "Non-GMO"]}'::jsonb,
    25,
    1000,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000519',
    '00000000-0000-0000-0000-000000000024',
    'Pineapple Coconut Water Blend',
    'Refreshing blend of fresh pineapple juice and pure coconut water. Natural electrolyte drink.',
    'Beverages',
    'TBC-PCW-002',
    'https://images.unsplash.com/photo-1546548970-71785318a17b?w=800&h=600&fit=crop',
    '{"ingredients": "Coconut Water 60%, Pineapple Juice 40%", "volume_per_bottle": "330ml", "shelf_life": "12 months", "packaging": "Aluminum can or PET bottle", "sugar_content": "Natural sugars only", "certifications": ["Organic"]}'::jsonb,
    25,
    1000,
    true
  ),

  -- Healthy Bites Factory Products
  (
    '00000000-0000-0000-0000-000000000520',
    '00000000-0000-0000-0000-000000000025',
    'Superfood Energy Balls',
    'Nutrient-dense energy balls packed with dates, nuts, and superfoods. Perfect healthy snack.',
    'Snacks',
    'HBF-SEB-001',
    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop',
    '{"ingredients": "Dates, Almonds, Chia Seeds, Cacao, Coconut", "weight_per_pack": "120g (6 balls)", "shelf_life": "6 months", "packaging": "Biodegradable pouch", "allergens": "Contains nuts", "certifications": ["Vegan", "Gluten-Free", "Organic"]}'::jsonb,
    30,
    500,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000521',
    '00000000-0000-0000-0000-000000000025',
    'Quinoa Protein Bars',
    'High-protein snack bars with quinoa, nuts, and dried fruits. Clean ingredients only.',
    'Snacks',
    'HBF-QPB-002',
    'https://images.unsplash.com/photo-1604497181015-76590d828689?w=800&h=600&fit=crop',
    '{"ingredients": "Quinoa, Almonds, Dates, Hemp Seeds, Dark Chocolate", "weight_per_bar": "45g", "protein_per_bar": "8g", "shelf_life": "12 months", "packaging": "Individual wrapper in kraft box", "certifications": ["Vegan", "Non-GMO", "High Protein"]}'::jsonb,
    30,
    500,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  sku = EXCLUDED.sku,
  image_url = EXCLUDED.image_url,
  specifications = EXCLUDED.specifications,
  lead_time_days = EXCLUDED.lead_time_days,
  moq = EXCLUDED.moq,
  is_active = EXCLUDED.is_active;

-- ========================================
-- 7. INSERT PRODUCT PRICING TIERS
-- ========================================
INSERT INTO public.product_pricing (
  id,
  product_id,
  min_quantity,
  max_quantity,
  unit_price,
  currency
)
VALUES
  -- Tom Yum Paste pricing
  ('00000000-0000-0000-0000-000000000651', '00000000-0000-0000-0000-000000000516', 300, 999, 3.50, 'USD'),
  ('00000000-0000-0000-0000-000000000652', '00000000-0000-0000-0000-000000000516', 1000, 2999, 3.00, 'USD'),
  ('00000000-0000-0000-0000-000000000653', '00000000-0000-0000-0000-000000000516', 3000, 4999, 2.70, 'USD'),
  ('00000000-0000-0000-0000-000000000654', '00000000-0000-0000-0000-000000000516', 5000, null, 2.40, 'USD'),

  -- Green Curry Paste pricing
  ('00000000-0000-0000-0000-000000000655', '00000000-0000-0000-0000-000000000517', 300, 999, 3.50, 'USD'),
  ('00000000-0000-0000-0000-000000000656', '00000000-0000-0000-0000-000000000517', 1000, 2999, 3.00, 'USD'),
  ('00000000-0000-0000-0000-000000000657', '00000000-0000-0000-0000-000000000517', 3000, 4999, 2.70, 'USD'),
  ('00000000-0000-0000-0000-000000000658', '00000000-0000-0000-0000-000000000517', 5000, null, 2.40, 'USD'),

  -- Fresh Mango Juice pricing
  ('00000000-0000-0000-0000-000000000659', '00000000-0000-0000-0000-000000000518', 1000, 2499, 2.80, 'USD'),
  ('00000000-0000-0000-0000-000000000660', '00000000-0000-0000-0000-000000000518', 2500, 4999, 2.50, 'USD'),
  ('00000000-0000-0000-0000-000000000661', '00000000-0000-0000-0000-000000000518', 5000, 9999, 2.20, 'USD'),
  ('00000000-0000-0000-0000-000000000662', '00000000-0000-0000-0000-000000000518', 10000, null, 1.90, 'USD'),

  -- Pineapple Coconut Water Blend pricing
  ('00000000-0000-0000-0000-000000000663', '00000000-0000-0000-0000-000000000519', 1000, 2499, 2.80, 'USD'),
  ('00000000-0000-0000-0000-000000000664', '00000000-0000-0000-0000-000000000519', 2500, 4999, 2.50, 'USD'),
  ('00000000-0000-0000-0000-000000000665', '00000000-0000-0000-0000-000000000519', 5000, 9999, 2.20, 'USD'),
  ('00000000-0000-0000-0000-000000000666', '00000000-0000-0000-0000-000000000519', 10000, null, 1.90, 'USD'),

  -- Superfood Energy Balls pricing
  ('00000000-0000-0000-0000-000000000667', '00000000-0000-0000-0000-000000000520', 500, 999, 6.50, 'USD'),
  ('00000000-0000-0000-0000-000000000668', '00000000-0000-0000-0000-000000000520', 1000, 2499, 5.80, 'USD'),
  ('00000000-0000-0000-0000-000000000669', '00000000-0000-0000-0000-000000000520', 2500, 4999, 5.20, 'USD'),
  ('00000000-0000-0000-0000-000000000670', '00000000-0000-0000-0000-000000000520', 5000, null, 4.50, 'USD'),

  -- Quinoa Protein Bars pricing
  ('00000000-0000-0000-0000-000000000671', '00000000-0000-0000-0000-000000000521', 500, 999, 2.80, 'USD'),
  ('00000000-0000-0000-0000-000000000672', '00000000-0000-0000-0000-000000000521', 1000, 2499, 2.50, 'USD'),
  ('00000000-0000-0000-0000-000000000673', '00000000-0000-0000-0000-000000000521', 2500, 4999, 2.20, 'USD'),
  ('00000000-0000-0000-0000-000000000674', '00000000-0000-0000-0000-000000000521', 5000, null, 1.90, 'USD')
ON CONFLICT (id) DO UPDATE SET
  min_quantity = EXCLUDED.min_quantity,
  max_quantity = EXCLUDED.max_quantity,
  unit_price = EXCLUDED.unit_price,
  currency = EXCLUDED.currency;
