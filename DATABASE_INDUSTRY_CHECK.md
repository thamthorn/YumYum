# Database Industry Data Check

## Problem

The matching system is finding OEMs with "Packaging" industry when searching for "F&B" industry. This means the database has inconsistent industry values.

## Step 1: Check Current Industry Values

Run this SQL in your Supabase SQL Editor to see what industries exist:

```sql
-- Check all unique industries in organizations
SELECT DISTINCT industry, COUNT(*) as count
FROM organizations
WHERE type = 'oem'
GROUP BY industry
ORDER BY industry;
```

## Step 2: Check Industries Table

```sql
-- See all valid industry keys
SELECT * FROM industries ORDER BY key;
```

## Expected Industry Keys

Based on your app, these should be the valid industry keys:

- `F&B` (Food & Beverage)
- `Fashion`
- `Cosmetics`
- `Medical/Dental` or `Medical`
- `Education`
- `Packaging`

## Step 3: Fix Inconsistent Data (if needed)

If you find organizations with "Packaging" but you want them in "F&B", run:

```sql
-- Example: Move Packaging OEMs to F&B (if that's what you want)
UPDATE organizations
SET industry = 'F&B'
WHERE industry = 'Packaging' AND type = 'oem';
```

**OR** if Packaging should be its own category, make sure it's in the industries table:

```sql
-- Add Packaging as a valid industry
INSERT INTO industries (key, label)
VALUES ('Packaging', 'Packaging & Materials')
ON CONFLICT (key) DO NOTHING;
```

## Step 4: Ensure Consistent Case

Make all industry keys consistent (recommend lowercase or exact case):

```sql
-- Check for case inconsistencies
SELECT industry, COUNT(*)
FROM organizations
WHERE type = 'oem'
GROUP BY industry
HAVING COUNT(*) > 0
ORDER BY LOWER(industry), industry;
```

## Step 5: Add Validation (Optional)

Add a foreign key constraint to prevent future inconsistencies (if not already present):

```sql
-- This should already exist based on your schema
ALTER TABLE organizations
ADD CONSTRAINT organizations_industry_fkey
FOREIGN KEY (industry)
REFERENCES industries(key);
```

## Recommendation

**Option 1: Keep Packaging Separate**

- Add "Packaging" to the industries table
- Update your buyer onboarding UI to include "Packaging" as an option
- Keep F&B and Packaging as distinct industries

**Option 2: Merge into F&B**

- If packaging companies primarily serve F&B customers
- Update all "Packaging" OEMs to "F&B" industry
- They'll show up in F&B searches

**Option 3: Use Tags Instead**

- Keep industry as broad category (F&B)
- Add a separate "specializations" or "tags" field
- Example: F&B OEM with tags: ["packaging", "bottling", "labeling"]
