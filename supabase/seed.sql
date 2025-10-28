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
