-- Industry reference data
insert into public.industries (key, label)
values
  ('Fashion', 'Fashion'),
  ('F&B', 'Food & Beverage'),
  ('Cosmetics', 'Cosmetics'),
  ('Dental/Medical', 'Dental / Medical'),
  ('Education', 'Education'),
  ('Packaging', 'Packaging'),
  ('Other', 'Other')
on conflict (key) do update set label = excluded.label;

-- Certification reference data
insert into public.certifications (id, name, description)
values
  ('00000000-0000-0000-0000-000000000201', 'ISO 9001:2015', 'Quality management'),
  ('00000000-0000-0000-0000-000000000202', 'GMP', 'Good manufacturing practice'),
  ('00000000-0000-0000-0000-000000000203', 'OEKO-TEX', 'Textile safety standard'),
  ('00000000-0000-0000-0000-000000000204', 'ISO 9001', 'ISO 9001 (legacy)'),
  ('00000000-0000-0000-0000-000000000205', 'Organic', 'Certified organic production'),
  ('00000000-0000-0000-0000-000000000206', 'ISO 22000', 'Food safety management'),
  ('00000000-0000-0000-0000-000000000207', 'HACCP', 'Hazard analysis and critical control points'),
  ('00000000-0000-0000-0000-000000000208', 'FDA', 'Food and Drug Administration compliance'),
  ('00000000-0000-0000-0000-000000000209', 'Natural Certification', 'Certified natural ingredients'),
  ('00000000-0000-0000-0000-000000000210', 'ISO 22716', 'Cosmetics good manufacturing practices'),
  ('00000000-0000-0000-0000-000000000211', 'CE Mark', 'European conformity mark'),
  ('00000000-0000-0000-0000-000000000212', 'Safety Standards', 'General safety compliance'),
  ('00000000-0000-0000-0000-000000000213', 'Organic Certification', 'Certified organic production'),
  ('00000000-0000-0000-0000-000000000214', 'ISO 13485', 'Medical devices quality management')
on conflict (id) do update set name = excluded.name, description = excluded.description;

-- Service reference data
insert into public.services (id, name, description)
values
  ('00000000-0000-0000-0000-000000000301', 'Design Consultation', 'Collaborative product design support'),
  ('00000000-0000-0000-0000-000000000302', 'Sampling & Prototyping', 'Prototype development and iteration'),
  ('00000000-0000-0000-0000-000000000303', 'Mass Production', 'High-volume manufacturing'),
  ('00000000-0000-0000-0000-000000000304', 'Quality Control', 'Quality assurance services'),
  ('00000000-0000-0000-0000-000000000305', 'Custom Packaging', 'Packaging design & sourcing'),
  ('00000000-0000-0000-0000-000000000306', 'Logistics Support', 'Cross-border shipping coordination'),
  ('00000000-0000-0000-0000-000000000307', 'Custom Design', 'Tailored product design services'),
  ('00000000-0000-0000-0000-000000000308', 'Small Batches', 'Low volume production runs'),
  ('00000000-0000-0000-0000-000000000309', 'Fast Sampling', 'Accelerated sample turnaround'),
  ('00000000-0000-0000-0000-000000000310', 'Custom Orders', 'Made-to-order production workflows'),
  ('00000000-0000-0000-0000-000000000311', 'Flexible MOQ', 'Adjustable minimum order quantities'),
  ('00000000-0000-0000-0000-000000000312', 'Research & Development', 'In-house R&D capabilities'),
  ('00000000-0000-0000-0000-000000000313', 'Packaging', 'Standard packaging solutions'),
  ('00000000-0000-0000-0000-000000000314', 'Organic Production', 'Certified organic processing'),
  ('00000000-0000-0000-0000-000000000315', 'Custom Recipes', 'Recipe formulation and iteration'),
  ('00000000-0000-0000-0000-000000000316', 'Private Label', 'White-label production services'),
  ('00000000-0000-0000-0000-000000000317', 'Formulation', 'Cosmetic formulation services'),
  ('00000000-0000-0000-0000-000000000318', 'Testing', 'Product testing and QA'),
  ('00000000-0000-0000-0000-000000000319', 'Natural Formulas', 'Plant-based formulation expertise'),
  ('00000000-0000-0000-0000-000000000320', 'Custom Branding', 'Branding and packaging design'),
  ('00000000-0000-0000-0000-000000000321', 'FDA Compliant', 'FDA documentation and compliance support'),
  ('00000000-0000-0000-0000-000000000322', 'ISO Certified', 'ISO-compliant production workflows'),
  ('00000000-0000-0000-0000-000000000323', 'Precision Equipment', 'High-precision manufacturing equipment'),
  ('00000000-0000-0000-0000-000000000324', 'Educational Toys', 'Educational toy manufacturing'),
  ('00000000-0000-0000-0000-000000000325', 'Books', 'Book printing and binding'),
  ('00000000-0000-0000-0000-000000000326', 'Custom Materials', 'Tailored educational materials'),
  ('00000000-0000-0000-0000-000000000327', 'Multi-category', 'Multi-category production lines'),
  ('00000000-0000-0000-0000-000000000328', 'Flexible Production', 'Adaptable production capacity'),
  ('00000000-0000-0000-0000-000000000329', 'R&D Support', 'Research and development support services')
on conflict (id) do update set name = excluded.name, description = excluded.description;

-- OEM organizations
insert into public.organizations (
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
values
  (
    '00000000-0000-0000-0000-000000000011',
    'oem',
    'Premium Fashion Co.',
    'Fashion',
    'Bangkok, Thailand',
    'Premium garment manufacturing facility specializing in fashion and textile production.',
    'https://example.com/premium-fashion',
    'premium-fashion-co',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    'oem',
    'Artisan Textiles',
    'Fashion',
    'Chiang Mai, Thailand',
    'Artisan textile manufacturing with focus on quality and customization.',
    'https://example.com/artisan-textiles',
    'artisan-textiles',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    'oem',
    'Swift Fashion Studio',
    'Fashion',
    'Bangkok, Thailand',
    'Flexible MOQ for rapid SKU testing and small batch production.',
    NULL,
    'swift-fashion-studio',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    'oem',
    'Food Innovation Labs',
    'F&B',
    'Samut Prakan, Thailand',
    'High-capacity food production with comprehensive R&D capabilities.',
    NULL,
    'food-innovation-labs',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    'oem',
    'Organic Snacks Co.',
    'F&B',
    'Nakhon Pathom, Thailand',
    'Organic snack manufacturing with custom recipe development.',
    NULL,
    'organic-snacks-co',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000016',
    'oem',
    'Bangkok Beauty Labs',
    'Cosmetics',
    'Bangkok, Thailand',
    'Premium cosmetics manufacturing with in-house formulation lab.',
    NULL,
    'bangkok-beauty-labs',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000017',
    'oem',
    'Natural Skincare Studio',
    'Cosmetics',
    'Phuket, Thailand',
    'Natural skincare with flexible MOQ for testing.',
    NULL,
    'natural-skincare-studio',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000018',
    'oem',
    'MedTech Manufacturing',
    'Dental/Medical',
    'Pathum Thani, Thailand',
    'Medical device manufacturing with strict quality controls.',
    NULL,
    'medtech-manufacturing',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000019',
    'oem',
    'Learning Materials Co.',
    'Education',
    'Bangkok, Thailand',
    'Educational materials and toys manufacturing.',
    NULL,
    'learning-materials-co',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000020',
    'oem',
    'Custom Manufacturing Hub',
    'Other',
    'Chonburi, Thailand',
    'Multi-category manufacturing with flexible capabilities.',
    NULL,
    'custom-manufacturing-hub',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    'oem',
    'EcoPack Solutions',
    'Packaging',
    'Bangkok, Thailand',
    'Sustainable packaging manufacturing with eco-friendly materials.',
    NULL,
    'ecopack-solutions',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000022',
    'oem',
    'Premium Packaging Co.',
    'Packaging',
    'Samut Prakan, Thailand',
    'High-quality custom packaging for luxury brands.',
    NULL,
    'premium-packaging-co',
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do update set
  display_name = excluded.display_name,
  industry = excluded.industry,
  location = excluded.location,
  description = excluded.description,
  website = excluded.website,
  slug = excluded.slug,
  updated_at = excluded.updated_at;

-- OEM profiles
insert into public.oem_profiles (
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
values
  (
    '00000000-0000-0000-0000-000000000011',
    'large',
    1000,
    50000,
    45,
    24,
    true,
    'Premium garment manufacturing facility specializing in fashion and textile production.',
    true,
    4.8,
    127,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    'medium',
    500,
    5000,
    30,
    12,
    true,
    'Artisan textile manufacturing with focus on quality and customization.',
    false,
    4.6,
    45,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    'small',
    100,
    2000,
    14,
    6,
    true,
    'Flexible MOQ for rapid SKU testing and small batch production.',
    false,
    4.9,
    32,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    'large',
    5000,
    100000,
    60,
    24,
    true,
    'High-capacity food production with comprehensive R&D capabilities.',
    true,
    4.7,
    89,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    'medium',
    1000,
    20000,
    45,
    18,
    true,
    'Organic snack manufacturing with custom recipe development.',
    true,
    4.5,
    56,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000016',
    'large',
    2000,
    50000,
    50,
    24,
    true,
    'Premium cosmetics manufacturing with in-house formulation lab.',
    true,
    4.7,
    103,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000017',
    'small',
    300,
    3000,
    21,
    12,
    true,
    'Natural skincare with flexible MOQ for testing.',
    false,
    4.8,
    28,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000018',
    'large',
    1000,
    30000,
    60,
    36,
    false,
    'Medical device manufacturing with strict quality controls.',
    true,
    4.9,
    67,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000019',
    'medium',
    500,
    10000,
    40,
    24,
    true,
    'Educational materials and toys manufacturing.',
    true,
    4.6,
    41,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000020',
    'medium',
    500,
    20000,
    35,
    18,
    true,
    'Multi-category manufacturing with flexible capabilities.',
    true,
    4.5,
    52,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    'medium',
    1000,
    100000,
    30,
    24,
    true,
    'Sustainable packaging manufacturing with eco-friendly materials.',
    true,
    4.7,
    89,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000022',
    'large',
    5000,
    500000,
    45,
    12,
    true,
    'High-quality custom packaging for luxury brands.',
    true,
    4.9,
    156,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (organization_id) do update set
  scale = excluded.scale,
  moq_min = excluded.moq_min,
  moq_max = excluded.moq_max,
  lead_time_days = excluded.lead_time_days,
  response_time_hours = excluded.response_time_hours,
  prototype_support = excluded.prototype_support,
  short_description = excluded.short_description,
  cross_border = excluded.cross_border,
  rating = excluded.rating,
  total_reviews = excluded.total_reviews,
  updated_at = excluded.updated_at;

-- OEM certifications snapshot
insert into public.oem_certifications (
  oem_org_id,
  certification_id,
  verified,
  verification_tier,
  verified_at,
  created_at
)
values
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000201',
    true,
    'trusted_partner',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000202',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000203',
    false,
    'none',
    null,
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000204',
    true,
    'verified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000206',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000202',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000208',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000207',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000213',
    true,
    'verified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000202',
    true,
    'verified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000210',
    true,
    'trusted_partner',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000202',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000208',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-000000000209',
    true,
    'verified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-000000000214',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-000000000208',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-000000000211',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000019',
    '00000000-0000-0000-0000-000000000212',
    true,
    'verified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000204',
    true,
    'verified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000201',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000205',
    true,
    'verified',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000201',
    true,
    'trusted_partner',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000202',
    true,
    'certified',
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (oem_org_id, certification_id) do update set
  verified = excluded.verified,
  verification_tier = excluded.verification_tier,
  verified_at = excluded.verified_at,
  created_at = excluded.created_at;

-- OEM services mappings
insert into public.oem_services (oem_org_id, service_id, created_at)
values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000301', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000302', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000303', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000304', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000305', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000306', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000307', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000302', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000308', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000309', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000310', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000311', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000312', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000303', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000313', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000304', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000314', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000315', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000316', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000317', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000318', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000303', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000313', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000319', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000308', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000320', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000321', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000322', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000323', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000324', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000325', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000326', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000327', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000328', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000329', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000305', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000313', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000304', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000301', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000305', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000320', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000303', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000306', timezone('utc', now()))
on conflict (oem_org_id, service_id) do nothing;

-- OEM languages
insert into public.oem_languages (oem_org_id, language_code, proficiency, created_at)
values
  ('00000000-0000-0000-0000-000000000011', 'en', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000011', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000011', 'zh', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000012', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000012', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000013', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000013', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000014', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000014', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000014', 'ja', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000015', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000015', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000016', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000016', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000016', 'zh', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000017', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000017', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000018', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000018', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000019', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000019', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000020', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000020', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000021', 'en', 'business', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000021', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000022', 'en', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000022', 'th', 'native', timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000022', 'zh', 'business', timezone('utc', now()))
on conflict (oem_org_id, language_code) do update set
  proficiency = excluded.proficiency,
  created_at = excluded.created_at;

-- OEM previous products (sample)
insert into public.oem_previous_products (
  id,
  oem_org_id,
  title,
  image_url,
  tags,
  note,
  created_at
)
values
  (
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000011',
    'Premium Cotton T-Shirt Collection',
    'https://images.squarespace-cdn.com/content/v1/5ed6e10fb011a123217ba702/1dd163cd-d007-4455-9e95-518ab99920ad/z4549404022185_c83beccb459d13c02f7ed051f92676b5.jpg',
    array['Mass Production', 'Export Quality'],
    '10,000 units delivered to EU market',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000011',
    'Sustainable Denim Line',
    'https://www.zevadenim.com/wp-content/uploads/2023/08/%EF%81%ACDenim-Recycling-and-Upcycling.webp',
    array['OEKO-TEX', 'Eco-friendly'],
    'Organic cotton denim with water-saving process',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000012',
    'Handwoven Silk Scarves',
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1200&h=900&fit=crop',
    array['Artisan', 'Custom Design'],
    'Traditional Thai silk weaving technique',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000404',
    '00000000-0000-0000-0000-000000000013',
    'A-line Skirt – Capsule Drop',
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=1200&h=900&fit=crop',
    array['Sampling', 'Low MOQ'],
    '500 pcs pilot run completed in 14 days',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000405',
    '00000000-0000-0000-0000-000000000013',
    'Pleated Blouse – SS Collection',
    'https://images.unsplash.com/photo-1564257577-31c6e18c5371?w=1200&h=900&fit=crop',
    array['Rapid SKU Test'],
    'Two-week turnaround from sample to production',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000406',
    '00000000-0000-0000-0000-000000000013',
    'Streetwear Hoodie Prototype',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&h=900&fit=crop',
    array['Fast Sampling', 'Prototype'],
    'Custom embroidery and print',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000407',
    '00000000-0000-0000-0000-000000000014',
    '250ml Spout Pouch – Dairy Range',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=1200&h=900&fit=crop',
    array['Food-grade', 'High volume'],
    'For chilled distribution lines, 50,000 units/month',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000408',
    '00000000-0000-0000-0000-000000000014',
    'Ready-to-Drink Beverage Line',
    'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=1200&h=900&fit=crop',
    array['FDA Approved', 'Export'],
    'Multiple flavor variants with custom formulation',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000409',
    '00000000-0000-0000-0000-000000000014',
    'Protein Bar Production',
    'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=1200&h=900&fit=crop',
    array['R&D Support', 'HACCP'],
    'Full R&D and production support',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-00000000040A',
    '00000000-0000-0000-0000-000000000015',
    'Organic Granola Mix',
    'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=1200&h=900&fit=crop',
    array['Organic Certified', 'Custom Recipe'],
    'Three flavor variants for private label',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-00000000040B',
    '00000000-0000-0000-0000-000000000015',
    'Dried Fruit Snack Packs',
    'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=1200&h=900&fit=crop',
    array['No Preservatives', 'Export Ready'],
    'Flexible packaging options available',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-00000000040C',
    '00000000-0000-0000-0000-000000000016',
    'Cosmetic Airless Bottle – 50ml',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&h=900&fit=crop',
    array['GMP', 'Export Quality'],
    'Batch QA passed AQL 1.0, 10,000 units',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-00000000040D',
    '00000000-0000-0000-0000-000000000016',
    'Serum Line with Custom Formulation',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&h=900&fit=crop',
    array['Custom Formula', 'Testing'],
    'Full formulation and stability testing included',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-00000000040E',
    '00000000-0000-0000-0000-000000000016',
    'Luxury Face Cream Collection',
    'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=1200&h=900&fit=crop',
    array['Premium', 'FDA Approved'],
    'Three SKUs with premium packaging',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-00000000040F',
    '00000000-0000-0000-0000-000000000017',
    'Herbal Face Soap Collection',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1200&h=900&fit=crop',
    array['Natural', 'Low MOQ'],
    'Three botanical variants, 300 units each',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000410',
    '00000000-0000-0000-0000-000000000017',
    'Coconut Oil Body Butter',
    'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=1200&h=900&fit=crop',
    array['Organic Ingredients', 'Custom Branding'],
    'Small batch production with artisan touch',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000411',
    '00000000-0000-0000-0000-000000000018',
    'Sterile Medical Packaging',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&h=900&fit=crop',
    array['ISO 13485', 'FDA Approved'],
    'Cleanroom production for surgical instruments',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000412',
    '00000000-0000-0000-0000-000000000018',
    'Dental Instrument Trays',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&h=900&fit=crop',
    array['Medical Grade', 'CE Mark'],
    'Autoclavable with full documentation',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000413',
    '00000000-0000-0000-0000-000000000018',
    'Diagnostic Test Kit Packaging',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=1200&h=900&fit=crop',
    array['Quality Control', 'Export'],
    'Batch validation and full traceability',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000414',
    '00000000-0000-0000-0000-000000000019',
    'Educational Flashcard Sets',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=900&fit=crop',
    array['Safety Certified', 'Custom Design'],
    'Multiple subject sets with custom artwork',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000415',
    '00000000-0000-0000-0000-000000000019',
    'Activity Books for Children',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&h=900&fit=crop',
    array['Print Quality', 'Educational'],
    'Full-color printing with eco-friendly paper',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000416',
    '00000000-0000-0000-0000-000000000020',
    'Custom Promotional Products',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=900&fit=crop',
    array['Multi-category', 'Flexible MOQ'],
    'Various product lines for corporate gifts',
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000417',
    '00000000-0000-0000-0000-000000000020',
    'Eco-friendly Packaging Solutions',
    'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=1200&h=900&fit=crop',
    array['Sustainable', 'R&D Support'],
    'Biodegradable materials development',
    timezone('utc', now())
  )
on conflict (id) do update set
  title = excluded.title,
  image_url = excluded.image_url,
  tags = excluded.tags,
  note = excluded.note,
  created_at = excluded.created_at;

-- ============================================
-- PRODUCTS & PRICING DATA
-- ============================================

-- Products for Premium Fashion Co. (Fashion)
insert into public.products (
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
values
  (
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000011',
    'Premium Cotton T-Shirt',
    'High-quality 100% organic cotton t-shirt with custom printing options. Perfect for fashion brands and promotional merchandise.',
    'Apparel',
    'PFC-TS-001',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
    '{"material": "100% Organic Cotton", "weight": "180 GSM", "sizes": ["XS", "S", "M", "L", "XL", "XXL"], "colors": ["White", "Black", "Navy", "Gray"], "printing": "Screen print or DTG available"}'::jsonb,
    30,
    500,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000011',
    'Eco-Friendly Tote Bag',
    'Sustainable canvas tote bag with reinforced handles. Ideal for retail packaging or promotional giveaways.',
    'Accessories',
    'PFC-TB-002',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=600&fit=crop',
    '{"material": "Organic Canvas", "dimensions": "38cm x 42cm x 10cm", "handle_length": "65cm", "weight": "120 GSM", "customization": "Logo print, embroidery available"}'::jsonb,
    25,
    1000,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000503',
    '00000000-0000-0000-0000-000000000011',
    'Silk Scarf Collection',
    'Luxurious 100% mulberry silk scarves with custom patterns. Premium gift item or fashion accessory.',
    'Accessories',
    'PFC-SC-003',
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&h=600&fit=crop',
    '{"material": "100% Mulberry Silk", "dimensions": "90cm x 90cm", "weight": "16 Momme", "finish": "Hand-rolled edges", "printing": "Digital print, custom designs"}'::jsonb,
    45,
    200,
    true
  ),

  -- Products for Artisan Textiles (Fashion)
  (
    '00000000-0000-0000-0000-000000000504',
    '00000000-0000-0000-0000-000000000012',
    'Hand-Woven Cushion Cover',
    'Artisan hand-woven cushion covers using traditional Thai weaving techniques. Each piece is unique.',
    'Home Decor',
    'AT-CC-001',
    'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&h=600&fit=crop',
    '{"material": "Cotton & Silk Blend", "dimensions": "45cm x 45cm", "technique": "Hand-woven", "patterns": "Traditional Thai patterns", "colors": "Natural dyes available"}'::jsonb,
    35,
    100,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000505',
    '00000000-0000-0000-0000-000000000012',
    'Custom Embroidered Denim Jacket',
    'Premium denim jacket with custom embroidery services. Perfect for fashion brands looking for unique pieces.',
    'Apparel',
    'AT-DJ-002',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop',
    '{"material": "100% Cotton Denim", "weight": "12 oz", "sizes": ["S", "M", "L", "XL"], "embroidery": "Custom designs up to 10 colors", "wash": "Stone washed finish"}'::jsonb,
    40,
    150,
    true
  ),

  -- Products for Thai Snacks Factory (F&B)
  (
    '00000000-0000-0000-0000-000000000506',
    '00000000-0000-0000-0000-000000000013',
    'Coconut Chips - Original Flavor',
    'Crispy coconut chips made from premium Thai coconuts. Light, healthy snack with no artificial additives.',
    'Snacks',
    'TSF-CC-001',
    'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&h=600&fit=crop',
    '{"ingredients": "Coconut, Sea Salt, Coconut Oil", "weight_per_bag": "40g", "shelf_life": "12 months", "packaging": "Resealable pouch", "certifications": ["Organic", "Non-GMO"]}'::jsonb,
    20,
    5000,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000507',
    '00000000-0000-0000-0000-000000000013',
    'Mango Sticky Rice Snack Bar',
    'Traditional Thai dessert transformed into a convenient snack bar. Authentic taste in portable format.',
    'Snacks',
    'TSF-MSR-002',
    'https://images.unsplash.com/photo-1625814069630-f5d4c5d4b05e?w=800&h=600&fit=crop',
    '{"ingredients": "Glutinous Rice, Mango, Coconut Cream, Sugar", "weight_per_bar": "35g", "shelf_life": "6 months", "packaging": "Individual wrapper", "allergens": ["Tree nuts (coconut)"]}'::jsonb,
    25,
    10000,
    true
  ),

  -- Products for Organic Beverages Ltd (F&B)
  (
    '00000000-0000-0000-0000-000000000508',
    '00000000-0000-0000-0000-000000000014',
    'Cold-Pressed Green Juice',
    'Organic cold-pressed juice blend with kale, cucumber, and apple. Premium health beverage.',
    'Beverages',
    'OB-GJ-001',
    'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&h=600&fit=crop',
    '{"ingredients": "Kale, Cucumber, Green Apple, Lemon, Ginger", "volume": "300ml", "shelf_life": "7 days refrigerated", "packaging": "Glass bottle", "certifications": ["USDA Organic", "Non-GMO"]}'::jsonb,
    15,
    500,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000509',
    '00000000-0000-0000-0000-000000000014',
    'Herbal Tea Sachets - Lemongrass',
    'Premium organic lemongrass tea in biodegradable pyramid sachets. Refreshing and calming blend.',
    'Beverages',
    'OB-LT-002',
    'https://images.unsplash.com/photo-1563822249366-67cb980d6e1e?w=800&h=600&fit=crop',
    '{"ingredients": "100% Organic Lemongrass", "sachets_per_box": "20", "weight_per_sachet": "2g", "packaging": "Compostable pyramid sachets", "shelf_life": "24 months"}'::jsonb,
    30,
    2000,
    true
  ),

  -- Products for Natural Beauty Labs (Cosmetics)
  (
    '00000000-0000-0000-0000-000000000510',
    '00000000-0000-0000-0000-000000000015',
    'Vitamin C Serum',
    'Powerful anti-aging serum with 20% L-Ascorbic Acid. Brightens skin and reduces fine lines.',
    'Skincare',
    'NBL-VCS-001',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=600&fit=crop',
    '{"active_ingredients": "20% L-Ascorbic Acid, Vitamin E, Ferulic Acid", "volume": "30ml", "packaging": "Amber glass dropper bottle", "pH": "3.0-3.5", "shelf_life": "12 months unopened"}'::jsonb,
    35,
    500,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000511',
    '00000000-0000-0000-0000-000000000015',
    'Hyaluronic Acid Moisturizer',
    'Intense hydration cream with multi-molecular weight hyaluronic acid. Suitable for all skin types.',
    'Skincare',
    'NBL-HAM-002',
    'https://images.unsplash.com/photo-1556228852-80f3f2e6f1ba?w=800&h=600&fit=crop',
    '{"active_ingredients": "3% Hyaluronic Acid Complex, Ceramides, Niacinamide", "volume": "50ml", "packaging": "Airless pump bottle", "texture": "Lightweight gel-cream", "shelf_life": "18 months"}'::jsonb,
    30,
    1000,
    true
  ),

  -- Products for Green Cosmetics Co. (Cosmetics)
  (
    '00000000-0000-0000-0000-000000000512',
    '00000000-0000-0000-0000-000000000016',
    'Luxury Rose Face Cream',
    'Premium anti-aging face cream with damascus rose extract and gold peptides. Ultra-luxurious formula.',
    'Skincare',
    'GCC-RFC-001',
    'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=600&fit=crop',
    '{"key_ingredients": "Damascus Rose Extract, Gold Peptides, Retinol, Squalane", "volume": "50ml", "packaging": "Luxury glass jar with gold cap", "certifications": ["FDA Registered"], "shelf_life": "24 months"}'::jsonb,
    45,
    300,
    true
  ),

  -- Products for EcoPack Solutions (Packaging)
  (
    '00000000-0000-0000-0000-000000000513',
    '00000000-0000-0000-0000-000000000021',
    'Compostable Food Container',
    'Biodegradable food container made from sugarcane bagasse. Perfect for takeaway meals.',
    'Food Packaging',
    'EPS-CFC-001',
    'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&h=600&fit=crop',
    '{"material": "Sugarcane Bagasse", "dimensions": "23cm x 15cm x 5cm", "capacity": "1000ml", "temperature_range": "-20°C to 120°C", "certifications": ["Compostable", "FDA Approved"]}'::jsonb,
    20,
    10000,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000514',
    '00000000-0000-0000-0000-000000000021',
    'Kraft Paper Mailer Box',
    'Eco-friendly shipping box with custom printing. Strong and sustainable e-commerce packaging.',
    'Shipping Packaging',
    'EPS-KPM-002',
    'https://images.unsplash.com/photo-1605461522175-47db3a053e0c?w=800&h=600&fit=crop',
    '{"material": "100% Recycled Kraft Paper", "dimensions": "30cm x 20cm x 10cm", "weight_capacity": "5kg", "customization": "Full-color printing available", "assembly": "Self-locking design"}'::jsonb,
    25,
    5000,
    true
  ),

  -- Products for Premium Packaging Co. (Packaging)
  (
    '00000000-0000-0000-0000-000000000515',
    '00000000-0000-0000-0000-000000000022',
    'Luxury Gift Box with Magnetic Closure',
    'Premium rigid gift box with magnetic closure. Perfect for high-end products and luxury brands.',
    'Gift Packaging',
    'PPC-LGB-001',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=600&fit=crop',
    '{"material": "Rigid Cardboard with Art Paper", "dimensions": "25cm x 20cm x 8cm", "finish": "Matte lamination with spot UV", "closure": "Hidden magnetic closure", "customization": "Embossing, foil stamping available"}'::jsonb,
    35,
    1000,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  sku = excluded.sku,
  image_url = excluded.image_url,
  specifications = excluded.specifications,
  lead_time_days = excluded.lead_time_days,
  moq = excluded.moq,
  is_active = excluded.is_active;

-- Product Pricing Tiers
insert into public.product_pricing (
  id,
  product_id,
  min_quantity,
  max_quantity,
  unit_price,
  currency
)
values
  -- Premium Cotton T-Shirt pricing (economy of scale)
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000501', 500, 999, 8.50, 'USD'),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000501', 1000, 2499, 7.80, 'USD'),
  ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000501', 2500, 4999, 7.20, 'USD'),
  ('00000000-0000-0000-0000-000000000604', '00000000-0000-0000-0000-000000000501', 5000, null, 6.50, 'USD'),

  -- Eco-Friendly Tote Bag pricing
  ('00000000-0000-0000-0000-000000000605', '00000000-0000-0000-0000-000000000502', 1000, 2499, 3.50, 'USD'),
  ('00000000-0000-0000-0000-000000000606', '00000000-0000-0000-0000-000000000502', 2500, 4999, 3.20, 'USD'),
  ('00000000-0000-0000-0000-000000000607', '00000000-0000-0000-0000-000000000502', 5000, 9999, 2.90, 'USD'),
  ('00000000-0000-0000-0000-000000000608', '00000000-0000-0000-0000-000000000502', 10000, null, 2.50, 'USD'),

  -- Silk Scarf Collection pricing
  ('00000000-0000-0000-0000-000000000609', '00000000-0000-0000-0000-000000000503', 200, 499, 28.00, 'USD'),
  ('00000000-0000-0000-0000-000000000610', '00000000-0000-0000-0000-000000000503', 500, 999, 25.50, 'USD'),
  ('00000000-0000-0000-0000-000000000611', '00000000-0000-0000-0000-000000000503', 1000, null, 23.00, 'USD'),

  -- Hand-Woven Cushion Cover pricing
  ('00000000-0000-0000-0000-000000000612', '00000000-0000-0000-0000-000000000504', 100, 249, 18.00, 'USD'),
  ('00000000-0000-0000-0000-000000000613', '00000000-0000-0000-0000-000000000504', 250, 499, 16.50, 'USD'),
  ('00000000-0000-0000-0000-000000000614', '00000000-0000-0000-0000-000000000504', 500, null, 15.00, 'USD'),

  -- Custom Embroidered Denim Jacket pricing
  ('00000000-0000-0000-0000-000000000615', '00000000-0000-0000-0000-000000000505', 150, 299, 42.00, 'USD'),
  ('00000000-0000-0000-0000-000000000616', '00000000-0000-0000-0000-000000000505', 300, 499, 38.50, 'USD'),
  ('00000000-0000-0000-0000-000000000617', '00000000-0000-0000-0000-000000000505', 500, null, 35.00, 'USD'),

  -- Coconut Chips pricing
  ('00000000-0000-0000-0000-000000000618', '00000000-0000-0000-0000-000000000506', 5000, 9999, 1.20, 'USD'),
  ('00000000-0000-0000-0000-000000000619', '00000000-0000-0000-0000-000000000506', 10000, 24999, 1.05, 'USD'),
  ('00000000-0000-0000-0000-000000000620', '00000000-0000-0000-0000-000000000506', 25000, 49999, 0.95, 'USD'),
  ('00000000-0000-0000-0000-000000000621', '00000000-0000-0000-0000-000000000506', 50000, null, 0.85, 'USD'),

  -- Mango Sticky Rice Snack Bar pricing
  ('00000000-0000-0000-0000-000000000622', '00000000-0000-0000-0000-000000000507', 10000, 19999, 1.35, 'USD'),
  ('00000000-0000-0000-0000-000000000623', '00000000-0000-0000-0000-000000000507', 20000, 49999, 1.20, 'USD'),
  ('00000000-0000-0000-0000-000000000624', '00000000-0000-0000-0000-000000000507', 50000, null, 1.05, 'USD'),

  -- Cold-Pressed Green Juice pricing
  ('00000000-0000-0000-0000-000000000625', '00000000-0000-0000-0000-000000000508', 500, 999, 4.50, 'USD'),
  ('00000000-0000-0000-0000-000000000626', '00000000-0000-0000-0000-000000000508', 1000, 2499, 4.20, 'USD'),
  ('00000000-0000-0000-0000-000000000627', '00000000-0000-0000-0000-000000000508', 2500, null, 3.80, 'USD'),

  -- Herbal Tea Sachets pricing
  ('00000000-0000-0000-0000-000000000628', '00000000-0000-0000-0000-000000000509', 2000, 4999, 6.50, 'USD'),
  ('00000000-0000-0000-0000-000000000629', '00000000-0000-0000-0000-000000000509', 5000, 9999, 5.80, 'USD'),
  ('00000000-0000-0000-0000-000000000630', '00000000-0000-0000-0000-000000000509', 10000, null, 5.20, 'USD'),

  -- Vitamin C Serum pricing
  ('00000000-0000-0000-0000-000000000631', '00000000-0000-0000-0000-000000000510', 500, 999, 12.50, 'USD'),
  ('00000000-0000-0000-0000-000000000632', '00000000-0000-0000-0000-000000000510', 1000, 2499, 11.20, 'USD'),
  ('00000000-0000-0000-0000-000000000633', '00000000-0000-0000-0000-000000000510', 2500, 4999, 10.00, 'USD'),
  ('00000000-0000-0000-0000-000000000634', '00000000-0000-0000-0000-000000000510', 5000, null, 9.00, 'USD'),

  -- Hyaluronic Acid Moisturizer pricing
  ('00000000-0000-0000-0000-000000000635', '00000000-0000-0000-0000-000000000511', 1000, 2499, 8.50, 'USD'),
  ('00000000-0000-0000-0000-000000000636', '00000000-0000-0000-0000-000000000511', 2500, 4999, 7.80, 'USD'),
  ('00000000-0000-0000-0000-000000000637', '00000000-0000-0000-0000-000000000511', 5000, null, 7.00, 'USD'),

  -- Luxury Rose Face Cream pricing
  ('00000000-0000-0000-0000-000000000638', '00000000-0000-0000-0000-000000000512', 300, 499, 35.00, 'USD'),
  ('00000000-0000-0000-0000-000000000639', '00000000-0000-0000-0000-000000000512', 500, 999, 32.00, 'USD'),
  ('00000000-0000-0000-0000-000000000640', '00000000-0000-0000-0000-000000000512', 1000, null, 29.00, 'USD'),

  -- Compostable Food Container pricing
  ('00000000-0000-0000-0000-000000000641', '00000000-0000-0000-0000-000000000513', 10000, 24999, 0.45, 'USD'),
  ('00000000-0000-0000-0000-000000000642', '00000000-0000-0000-0000-000000000513', 25000, 49999, 0.38, 'USD'),
  ('00000000-0000-0000-0000-000000000643', '00000000-0000-0000-0000-000000000513', 50000, 99999, 0.32, 'USD'),
  ('00000000-0000-0000-0000-000000000644', '00000000-0000-0000-0000-000000000513', 100000, null, 0.28, 'USD'),

  -- Kraft Paper Mailer Box pricing
  ('00000000-0000-0000-0000-000000000645', '00000000-0000-0000-0000-000000000514', 5000, 9999, 1.20, 'USD'),
  ('00000000-0000-0000-0000-000000000646', '00000000-0000-0000-0000-000000000514', 10000, 24999, 1.05, 'USD'),
  ('00000000-0000-0000-0000-000000000647', '00000000-0000-0000-0000-000000000514', 25000, null, 0.90, 'USD'),

  -- Luxury Gift Box pricing
  ('00000000-0000-0000-0000-000000000648', '00000000-0000-0000-0000-000000000515', 1000, 2499, 5.80, 'USD'),
  ('00000000-0000-0000-0000-000000000649', '00000000-0000-0000-0000-000000000515', 2500, 4999, 5.20, 'USD'),
  ('00000000-0000-0000-0000-000000000650', '00000000-0000-0000-0000-000000000515', 5000, null, 4.60, 'USD')
on conflict (id) do update set
  min_quantity = excluded.min_quantity,
  max_quantity = excluded.max_quantity,
  unit_price = excluded.unit_price,
  currency = excluded.currency;

-- Product Images (additional images for products)
insert into public.product_images (
  id,
  product_id,
  image_url,
  alt_text,
  display_order,
  is_primary
)
values
  -- Premium Cotton T-Shirt images
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000501', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop', 'Premium Cotton T-Shirt - Front View', 0, true),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000501', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=600&fit=crop', 'Premium Cotton T-Shirt - Back View', 1, false),
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000501', 'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800&h=600&fit=crop', 'Premium Cotton T-Shirt - Detail', 2, false),

  -- Silk Scarf images
  ('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000503', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&h=600&fit=crop', 'Silk Scarf - Main Image', 0, true),
  ('00000000-0000-0000-0000-000000000705', '00000000-0000-0000-0000-000000000503', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop', 'Silk Scarf - Pattern Detail', 1, false),

  -- Vitamin C Serum images
  ('00000000-0000-0000-0000-000000000706', '00000000-0000-0000-0000-000000000510', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=600&fit=crop', 'Vitamin C Serum - Product Shot', 0, true),
  ('00000000-0000-0000-0000-000000000707', '00000000-0000-0000-0000-000000000510', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&h=600&fit=crop', 'Vitamin C Serum - Texture', 1, false),

  -- Compostable Food Container images
  ('00000000-0000-0000-0000-000000000708', '00000000-0000-0000-0000-000000000513', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&h=600&fit=crop', 'Compostable Container - Main', 0, true),
  ('00000000-0000-0000-0000-000000000709', '00000000-0000-0000-0000-000000000513', 'https://images.unsplash.com/photo-1610557992985-655c7e39b6ac?w=800&h=600&fit=crop', 'Compostable Container - With Food', 1, false)
on conflict (id) do update set
  image_url = excluded.image_url,
  alt_text = excluded.alt_text,
  display_order = excluded.display_order,
  is_primary = excluded.is_primary;
