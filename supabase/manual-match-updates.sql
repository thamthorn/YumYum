-- Manual Match Status Updates
-- Use these queries to simulate OEM acceptance and progression

-- 1. View all matches for debugging
SELECT 
  m.id,
  m.status,
  m.score,
  bo.display_name as buyer_name,
  oo.display_name as oem_name,
  m.created_at
FROM matches m
JOIN organizations bo ON m.buyer_org_id = bo.id
JOIN organizations oo ON m.oem_org_id = oo.id
ORDER BY m.created_at DESC;

-- 2. Update a specific match to "in_discussion" (simulating OEM acceptance)
-- Replace 'MATCH_ID_HERE' with actual match ID
-- UPDATE matches 
-- SET status = 'in_discussion', updated_at = now()
-- WHERE id = 'MATCH_ID_HERE';

-- 3. Update all matches for a buyer to "in_discussion"
-- Replace 'BUYER_ORG_ID_HERE' with actual buyer organization ID
-- UPDATE matches 
-- SET status = 'in_discussion', updated_at = now()
-- WHERE buyer_org_id = 'BUYER_ORG_ID_HERE';

-- 4. Update the most recent match to "in_discussion"
-- UPDATE matches 
-- SET status = 'in_discussion', updated_at = now()
-- WHERE id = (
--   SELECT id FROM matches 
--   ORDER BY created_at DESC 
--   LIMIT 1
-- );

-- 5. Set specific match statuses for testing different states
-- Example: First match = contacted, second = in_discussion, third = quote_requested
-- UPDATE matches 
-- SET status = CASE 
--   WHEN id = (SELECT id FROM matches ORDER BY created_at DESC LIMIT 1 OFFSET 0) THEN 'quote_requested'
--   WHEN id = (SELECT id FROM matches ORDER BY created_at DESC LIMIT 1 OFFSET 1) THEN 'in_discussion'
--   WHEN id = (SELECT id FROM matches ORDER BY created_at DESC LIMIT 1 OFFSET 2) THEN 'contacted'
--   ELSE status
-- END,
-- updated_at = now()
-- WHERE id IN (
--   SELECT id FROM matches ORDER BY created_at DESC LIMIT 3
-- );

-- 6. Reset all matches back to 'new_match'
-- UPDATE matches 
-- SET status = 'new_match', updated_at = now();

-- Available statuses:
-- 'new_match'      - Initial match (system created)
-- 'contacted'      - Buyer reached out
-- 'in_discussion'  - Active conversation (shows as "accepted")
-- 'quote_requested'- Formal quote requested
-- 'declined'       - Match didn't work out
-- 'archived'       - Closed/archived
