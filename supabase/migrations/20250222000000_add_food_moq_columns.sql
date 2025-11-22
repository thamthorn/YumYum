-- Add missing MOQ columns for food categories
alter table public.oem_profiles add column if not exists moq_beverages integer;
alter table public.oem_profiles add column if not exists moq_snacks integer;
alter table public.oem_profiles add column if not exists moq_sauces_condiments integer;
alter table public.oem_profiles add column if not exists moq_bakery integer;
alter table public.oem_profiles add column if not exists moq_dairy_alternatives integer;
alter table public.oem_profiles add column if not exists moq_ready_to_eat integer;
alter table public.oem_profiles add column if not exists moq_desserts integer;
alter table public.oem_profiles add column if not exists moq_health_foods integer;
alter table public.oem_profiles add column if not exists moq_pet_food integer;
