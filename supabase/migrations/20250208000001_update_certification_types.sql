-- Update certification_type enum to include all certification types used in the frontend

-- First, we need to drop the enum and recreate it with new values
-- But since we can't easily modify enums in PostgreSQL, we'll use ALTER TYPE to add new values

-- Add new certification types to the enum
DO $$ 
BEGIN
  -- Add ISO22000 if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'ISO22000' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'certification_type')
  ) THEN
    ALTER TYPE public.certification_type ADD VALUE 'ISO22000';
  END IF;

  -- Add HACCP if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'HACCP' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'certification_type')
  ) THEN
    ALTER TYPE public.certification_type ADD VALUE 'HACCP';
  END IF;

  -- Add FSSC22000 if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'FSSC22000' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'certification_type')
  ) THEN
    ALTER TYPE public.certification_type ADD VALUE 'FSSC22000';
  END IF;

  -- Add BRC if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'BRC' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'certification_type')
  ) THEN
    ALTER TYPE public.certification_type ADD VALUE 'BRC';
  END IF;

  -- Add FDA as an alias (we'll map FDA to FDA_THAILAND in the frontend, but add it for flexibility)
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'FDA' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'certification_type')
  ) THEN
    ALTER TYPE public.certification_type ADD VALUE 'FDA';
  END IF;
END $$;

