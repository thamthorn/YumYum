-- Add industry field to products table
-- Migration: 20250206000000_add_industry_to_products

ALTER TABLE public.products
ADD COLUMN industry text REFERENCES public.industries(key);

CREATE INDEX products_industry_idx ON public.products (industry);

-- Optionally, update existing products based on OEM's industry
-- This is a one-time data migration - you can customize as needed
UPDATE public.products p
SET industry = o.industry
FROM public.oem_profiles op
JOIN public.organizations o ON op.organization_id = o.id
WHERE p.oem_org_id = op.organization_id;
