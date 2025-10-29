# YumYum - Logic Bug Analysis Report

**Date:** October 29, 2025  
**Focus:** Business Logic & Data Flow Issues  
**Status:** ✅ Issues #2, #4, #5 FIXED | ⚠️ Issues #1, #3, #6, #7 remain

---

## 🔴 CRITICAL Logic Bugs (2)

### 1. **Duplicate Review Check Logic Flaw** ⚠️ NOT FIXED

**File:** `domain/reviews/service.ts`  
**Lines:** 92-109  
**Severity:** 🔴 CRITICAL

**The Bug:**

```typescript
// Current logic
if (input.orderId) {
  duplicateQuery = duplicateQuery.eq("order_id", input.orderId);
} else {
  duplicateQuery = duplicateQuery.is("order_id", null);
}

if (existingReview) {
  throw new AppError("You have already reviewed this OEM for this order", {
    code: "duplicate_review",
  });
}
```

**Problem:**
A buyer can submit **MULTIPLE reviews for the same OEM** by:

1. First review: Submit WITHOUT orderId (stores `order_id = null`)
2. Second review: Submit WITH orderId (stores `order_id = 'ord-123'`)
3. Third review: Submit WITH different orderId (stores `order_id = 'ord-456'`)

The check only prevents duplicates within the same `(buyer, OEM, orderId)` combo, but allows:

- ❌ 1 review with `null` orderId
- ❌ Multiple reviews with different orderIds
- ❌ Spamming the same OEM with reviews

**Real-World Scenario:**

```
Buyer reviews "Food Innovation Labs":
- Review 1: No order specified → ✅ Created (order_id = null)
- Review 2: With Order #123 → ✅ Created (order_id = ord-123)  [SHOULD BE BLOCKED!]
- Review 3: With Order #456 → ✅ Created (order_id = ord-456)  [SHOULD BE BLOCKED!]

Result: OEM has 3 reviews from same buyer, rating inflated/deflated incorrectly!
```

**Correct Logic:**

```typescript
// OPTION 1: Allow ONE review per buyer-OEM pair (regardless of orders)
const { data: existingReview } = await supabase
  .from("reviews")
  .select("id")
  .eq("buyer_org_id", buyerOrgId)
  .eq("oem_org_id", input.oemOrgId)
  .maybeSingle();

if (existingReview) {
  throw new AppError(
    "You have already reviewed this OEM. You can edit your existing review instead.",
    { code: "duplicate_review" }
  );
}

// OPTION 2: Allow ONE review per order (better for auditing)
if (!input.orderId) {
  // If no order specified, check if ANY review exists for this OEM
  const { data: anyReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("buyer_org_id", buyerOrgId)
    .eq("oem_org_id", input.oemOrgId)
    .maybeSingle();

  if (anyReview) {
    throw new AppError(
      "You've already reviewed this OEM. Please link your review to a specific order.",
      { code: "review_order_required" }
    );
  }
} else {
  // If order specified, check for duplicate on that order
  const { data: orderReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("buyer_org_id", buyerOrgId)
    .eq("oem_org_id", input.oemOrgId)
    .eq("order_id", input.orderId)
    .maybeSingle();

  if (orderReview) {
    throw new AppError("You've already reviewed this order.", {
      code: "duplicate_review",
    });
  }
}
```

**Impact:**

- 🔴 Rating manipulation vulnerability
- 🔴 OEM ratings become inaccurate
- 🔴 Can spam reviews to inflate/deflate scores
- 🔴 Database bloat with duplicate data

---

### 2. **Match Score Logic Flaw - Industry Match Always Awarded** ✅ FIXED

**File:** `domain/matching/service.ts`  
**Lines:** 41-43  
**Severity:** 🔴 CRITICAL (NOW RESOLVED)

**The Bug:**

```typescript
export function calculateMatchScore(
  oem: MatchingOemRow,
  criteria: MatchCriteria
): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Industry match (40 points - base requirement)
  score += 40;  // ❌ ALWAYS ADDED, NO VALIDATION!
  reasons.push(`Industry expertise in ${criteria.industry}`);
```

**Problem:**
The function **ALWAYS gives 40 points for industry match** without checking if the OEM's industry actually matches the buyer's industry!

**Real-World Scenario:**

```
Buyer wants F&B manufacturer
OEM is in "Fashion" industry

Score calculation:
✅ +40 points for "Industry expertise in F&B"  ❌ WRONG!
✅ Reason: "Industry expertise in F&B"         ❌ LIE!

Result: Fashion OEM shows as 40% match for F&B buyer!
```

**Why This Happens:**
The industry filtering happens in the **query** (`findMatchingOems`), not in the **scoring function** (`calculateMatchScore`).

**Look at the caller:**

```typescript
// findMatchingOems - line 137
const { data: matchingOems, error: matchFetchError } = await supabase
  .from("oem_profiles")
  .select(/* ... */)
  .filter("organizations.industry", "eq", criteria.industry); // ✅ Filtered here

// Then for EACH matching OEM:
const matchResults = (matchingOems ?? []).map(
  (oem) => calculateMatchScore(oem, criteria) // ❌ Assumes industry already matches
);
```

**The Issue:**
While the current code works **IF** OEMs are pre-filtered by industry, it's:

1. **Fragile** - If someone calls `calculateMatchScore` directly without filtering, it breaks
2. **Misleading** - The function claims to check industry but doesn't
3. **Dangerous** - If the query filter is removed/changed, scores become wrong

**Correct Logic:**

```typescript
export function calculateMatchScore(
  oem: MatchingOemRow,
  criteria: MatchCriteria
): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Industry match (40 points - base requirement)
  const oemIndustry = oem.organizations?.industry?.toLowerCase() || "";
  const criteriaIndustry = criteria.industry.toLowerCase();

  if (oemIndustry === criteriaIndustry) {
    score += 40;
    reasons.push(`Industry expertise in ${criteria.industry}`);
  } else {
    // If called on non-matching industry, don't give points
    score += 0;
    reasons.push(
      `Industry mismatch: OEM is in ${oem.organizations?.industry || "unknown"}`
    );
  }

  // Rest of scoring...
}
```

**Alternative Fix (If you trust the pre-filtering):**

```typescript
// At least add a comment and assertion
// 1. Industry match (40 points - ASSUMES pre-filtered by industry in query)
if (
  !oem.organizations?.industry ||
  oem.organizations.industry.toLowerCase() !== criteria.industry.toLowerCase()
) {
  // This should never happen if properly filtered
  console.warn("calculateMatchScore called with non-matching industry", {
    oemId: oem.organization_id,
    oemIndustry: oem.organizations?.industry,
    criteriaIndustry: criteria.industry,
  });
  return {
    oemOrgId: oem.organization_id,
    score: 0,
    reasons: ["Industry mismatch"],
  };
}

score += 40;
reasons.push(`Industry expertise in ${criteria.industry}`);
```

**Impact:**

- 🔴 Current: Low risk (works due to pre-filtering)
- 🔴 Future: High risk if query changes
- 🔴 Function is not self-contained/testable
- 🔴 Could cause incorrect match scores if used elsewhere

---

## 🟠 HIGH Priority Logic Issues (3)

### 3. **Helpful Vote Race Condition** ⚠️ NOT FIXED (Skipped - no migrations)

**File:** `domain/reviews/service.ts`  
**Lines:** 285-330  
**Severity:** 🟠 HIGH

**The Bug:**

```typescript
export async function markReviewHelpful(
  reviewId: string,
  context: SupabaseRouteContext
): Promise<void> {
  // Add helpful vote
  const { error: voteError } = await supabase
    .from("review_helpful_votes")
    .insert({ review_id: reviewId, profile_id: userId });

  if (voteError) {
    // Already voted, try to remove vote
    const { error: removeError } = await supabase
      .from("review_helpful_votes")
      .delete()
      .eq("review_id", reviewId)
      .eq("profile_id", userId);
  }

  // Update helpful count
  const { count } = await supabase
    .from("review_helpful_votes")
    .select("*", { count: "exact", head: true })
    .eq("review_id", reviewId);

  await supabase
    .from("reviews")
    .update({ helpful_count: count || 0 })
    .eq("id", reviewId);
}
```

**Problem: Race Condition Between Count and Update**

**Scenario:**

```
Time  User A                    User B                    DB Count
----  ---------------------     ---------------------     --------
T1    Mark helpful (insert)     -                         1
T2    -                         Mark helpful (insert)     2
T3    Read count = 2            -                         2
T4    -                         Read count = 2            2
T5    Update count = 2          -                         2
T6    -                         Update count = 2          2  ❌ WRONG! Should be 2

Another scenario:
T1    Mark helpful (insert)     -                         1
T2    Read count = 1            -                         1
T3    -                         Mark helpful (insert)     2
T4    -                         Read count = 2            2
T5    Update count = 1          -                         1  ❌ WRONG!
T6    -                         Update count = 2          2  ✅ Fixed, but temporary wrong data
```

**The count can be incorrect** during concurrent requests.

**Better Approach:**

```typescript
export async function markReviewHelpful(
  reviewId: string,
  context: SupabaseRouteContext
): Promise<void> {
  const { supabase, session } = context;
  const userId = session.user.id;

  // Try to insert vote
  const { error: voteError } = await supabase
    .from("review_helpful_votes")
    .insert({
      review_id: reviewId,
      profile_id: userId,
    });

  if (voteError) {
    // Check if it's a duplicate (user already voted)
    if (voteError.code === "23505") {
      // PostgreSQL unique constraint violation
      // Remove vote (toggle off)
      await supabase
        .from("review_helpful_votes")
        .delete()
        .eq("review_id", reviewId)
        .eq("profile_id", userId);
    } else {
      throw new AppError("Failed to vote", {
        cause: voteError,
        code: "helpful_vote_failed",
      });
    }
  }

  // Let database trigger handle count update
  // OR use atomic increment/decrement:
  // await supabase.rpc('increment_helpful_count', { review_id: reviewId })
}
```

**Even Better: Use Database Trigger**

```sql
-- Create trigger to auto-update count (already exists in migration!)
-- The current migration already has this, so we should USE it instead of manual count

-- Remove manual count update from code entirely
-- Trust the trigger to keep count accurate
```

**Wait... checking the migration:**
Looking at `supabase/migrations/20250204170000_create_reviews_table.sql`...

**I DON'T SEE A TRIGGER FOR helpful_count!** ❌

The migration has triggers for `update_oem_rating()` but NOT for `helpful_count`.

**Impact:**

- 🟠 Race conditions cause incorrect helpful counts
- 🟠 Multiple users voting simultaneously = wrong numbers
- 🟠 Needs database trigger or atomic operations

**Fix:**
Add trigger to migration:

```sql
-- Function to update helpful_count
create or replace function public.update_helpful_count()
returns trigger as $$
begin
  update public.reviews
  set helpful_count = (
    select count(*)
    from public.review_helpful_votes
    where review_id = coalesce(new.review_id, old.review_id)
  )
  where id = coalesce(new.review_id, old.review_id);

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Trigger on insert
create trigger update_helpful_count_on_insert
  after insert on public.review_helpful_votes
  for each row
  execute function public.update_helpful_count();

-- Trigger on delete
create trigger update_helpful_count_on_delete
  after delete on public.review_helpful_votes
  for each row
  execute function public.update_helpful_count();
```

Then remove the manual count update from `markReviewHelpful()`.

---

### 4. **MOQ Scoring Logic Edge Case** ✅ FIXED

**File:** `domain/matching/service.ts`  
**Lines:** 46-60  
**Severity:** 🟠 MEDIUM-HIGH (NOW RESOLVED)

**The Bug:**

```typescript
// 2. MOQ compatibility (25 points)
if (criteria.moqMin !== undefined && criteria.moqMax !== undefined) {
  const oemMoqMin = oem.moq_min ?? 0;
  const oemMoqMax = oem.moq_max ?? Number.MAX_SAFE_INTEGER;

  // Check if there's overlap between buyer and OEM MOQ ranges
  if (criteria.moqMax >= oemMoqMin && criteria.moqMin <= oemMoqMax) {
    score += 25;
    reasons.push(
      `MOQ range compatible (${oemMoqMin.toLocaleString()}-${oemMoqMax.toLocaleString()} units)`
    );
  } else if (criteria.moqMin >= oemMoqMin) {
    score += 15;
    reasons.push(`Can handle your minimum order quantity`);
  }
}
```

**Problems:**

1. **OEM with moq_max = null gets Number.MAX_SAFE_INTEGER**

   - An OEM with `moq_min = 10000, moq_max = null` (meaning "10k minimum, no maximum")
   - Will match a buyer wanting 50-100 units
   - Overlap check: `100 >= 10000 && 50 <= Number.MAX_SAFE_INTEGER` = **FALSE**
   - ❌ This is correct rejection, but...

2. **The else-if clause is confusing:**

   ```typescript
   else if (criteria.moqMin >= oemMoqMin) {
     score += 15;
     reasons.push(`Can handle your minimum order quantity`);
   }
   ```

   When does this trigger?

   - When ranges DON'T overlap
   - But buyer's minimum is >= OEM's minimum

   **Example:**

   ```
   Buyer wants: 100-500 units
   OEM does: 1000-5000 units

   Overlap check: 500 >= 1000 && 100 <= 5000 = FALSE
   Else-if check: 100 >= 1000 = FALSE

   Score: 0 points ✅ CORRECT

   Another example:
   Buyer wants: 2000-3000 units
   OEM does: 1000-1500 units

   Overlap check: 3000 >= 1000 && 2000 <= 1500 = FALSE
   Else-if check: 2000 >= 1000 = TRUE

   Score: 15 points ❌ WRONG!
   Reason: "Can handle your minimum order quantity"

   Reality: Buyer wants 2000 units minimum, OEM can only do MAX 1500
   The OEM CANNOT handle the buyer's minimum!
   ```

**The else-if logic is backwards!**

**Correct Logic:**

```typescript
// 2. MOQ compatibility (25 points)
if (criteria.moqMin !== undefined && criteria.moqMax !== undefined) {
  const oemMoqMin = oem.moq_min ?? 0;
  const oemMoqMax = oem.moq_max ?? null;

  // Perfect overlap
  if (
    oemMoqMax !== null &&
    criteria.moqMax >= oemMoqMin &&
    criteria.moqMin <= oemMoqMax
  ) {
    score += 25;
    reasons.push(
      `MOQ range compatible (${oemMoqMin.toLocaleString()}-${oemMoqMax.toLocaleString()} units)`
    );
  }
  // Partial compatibility: Buyer's range is ABOVE OEM's minimum (and OEM has no max)
  else if (oemMoqMax === null && criteria.moqMin >= oemMoqMin) {
    score += 20;
    reasons.push(
      `Can handle quantities starting from ${criteria.moqMin} units`
    );
  }
  // Buyer's max is below OEM's minimum (too small for OEM)
  else if (criteria.moqMax < oemMoqMin) {
    score += 0;
    reasons.push(
      `Your order size (${criteria.moqMax} max) is below their minimum (${oemMoqMin})`
    );
  }
  // Buyer's min is above OEM's maximum (too large for OEM)
  else if (oemMoqMax !== null && criteria.moqMin > oemMoqMax) {
    score += 0;
    reasons.push(
      `Your order size (${criteria.moqMin} min) exceeds their capacity (${oemMoqMax} max)`
    );
  }
}
```

**Impact:**

- 🟠 Incorrect match scores for edge cases
- 🟠 Misleading reasons ("Can handle minimum" when they can't)
- 🟠 Users may waste time contacting incompatible OEMs

---

### 5. **Missing Transaction for Onboarding** ✅ FIXED

**File:** `domain/buyers/service.ts`  
**Lines:** 31-190  
**Severity:** 🟠 MEDIUM-HIGH (NOW RESOLVED)

**The Bug:**
The `processBuyerOnboarding` function performs multiple database operations:

1. Create/update organization
2. Create organization membership
3. Upsert buyer_profiles
4. Upsert buyer_preferences
5. Generate matches

**Problem:**
If step 3, 4, or 5 fails, the user is left in an inconsistent state:

- ✅ Organization created
- ✅ Membership created
- ❌ Profile failed to save
- ❌ Preferences failed to save
- ❌ No matches generated

Next time user tries to onboard:

- ❌ "Organization already exists" - uses existing broken org
- ❌ Still no profile/preferences
- ❌ Still no matches

**Correct Approach:**

```typescript
// Use Supabase transactions (via RPC or batching)
const { data, error } = await supabase.rpc("process_buyer_onboarding", {
  user_id: userId,
  company_name: rest.companyName,
  industry: rest.industry,
  // ... all parameters
});
```

Or handle rollback:

```typescript
try {
  // Create org
  const orgId = await createOrUpdateOrg(...);

  try {
    // Create profile
    await upsertProfile(...);
    await upsertPreferences(...);
  } catch (error) {
    // Rollback: delete org if newly created
    if (!existingMember) {
      await supabase.from('organizations').delete().eq('id', orgId);
      await supabase.from('organization_members').delete().eq('organization_id', orgId);
    }
    throw error;
  }
} catch (error) {
  // Handle error
}
```

**Impact:**

- 🟠 Partial onboarding leaves user in broken state
- 🟠 Hard to recover without manual database cleanup
- 🟠 User can't re-onboard (sees "org exists" error)

---

## 🟡 MEDIUM Priority Logic Issues (2)

### 6. **Scale Points Always Awarded** ⚠️ NOT FIXED

**File:** `domain/matching/service.ts`  
**Lines:** 77-87  
**Severity:** 🟡 MEDIUM

**The Bug:**

```typescript
// 4. Scale compatibility (10 points)
if (oem.scale) {
  score += 10;  // Always gives 10 points if scale exists
  const scaleLabel = /* ... */;
  reasons.push(`${scaleLabel}-scale manufacturer with proven capacity`);
}
```

**Problem:**
All OEMs with a scale value get 10 points, regardless of whether the scale matches the buyer's needs.

**Example:**

```
Buyer: Small startup wanting 100-500 units (small scale)
OEM: Large manufacturer (moq 50,000 units)

Score: +10 points for "Large-scale manufacturer"
Reality: This is a MISMATCH! Buyer too small for this OEM.
```

**Better Logic:**

```typescript
// 4. Scale compatibility (10 points)
if (oem.scale && criteria.moqMax) {
  // Determine buyer's scale from MOQ
  let buyerScale: "small" | "medium" | "large";
  if (criteria.moqMax < 1000) buyerScale = "small";
  else if (criteria.moqMax < 10000) buyerScale = "medium";
  else buyerScale = "large";

  // Exact match
  if (oem.scale === buyerScale) {
    score += 10;
    reasons.push(`Perfect scale match: ${oem.scale}-scale manufacturer`);
  }
  // Adjacent match (small-medium or medium-large)
  else if (
    (oem.scale === "medium" &&
      (buyerScale === "small" || buyerScale === "large")) ||
    (buyerScale === "medium" &&
      (oem.scale === "small" || oem.scale === "large"))
  ) {
    score += 5;
    reasons.push(`Compatible ${oem.scale}-scale manufacturer`);
  }
  // Mismatch
  else {
    score += 0;
    reasons.push(
      `Scale mismatch: ${oem.scale}-scale may not fit your ${buyerScale}-scale needs`
    );
  }
}
```

**Impact:**

- 🟡 All OEMs get same scale bonus
- 🟡 Scale doesn't actually help differentiate matches
- 🟡 May recommend incompatible sizes

---

### 7. **Location Scoring Substring Match Issue** ⚠️ NOT FIXED

**File:** `domain/matching/service.ts`  
**Lines:** 63-76  
**Severity:** 🟡 MEDIUM

**The Bug:**

```typescript
// 3. Location match (15 points)
if (criteria.location && oem.organizations?.location) {
  const buyerLocation = criteria.location.toLowerCase();
  const oemLocation = oem.organizations.location.toLowerCase();

  if (
    oemLocation.includes(buyerLocation) ||
    buyerLocation.includes(oemLocation)
  ) {
    score += 15;
    reasons.push(`Located in ${oem.organizations.location}`);
  }
}
```

**Problem: Substring matching can cause false positives**

**Examples:**

```
Buyer: "Bangkok"
OEM: "Bangkok"
Match: TRUE ✅

Buyer: "Bangkok"
OEM: "Not in Bangkok"
Match: TRUE ❌ (Bangkok is substring of "Not in Bangkok")

Buyer: "New York"
OEM: "New York City"
Match: TRUE ✅

Buyer: "York"
OEM: "New York City"
Match: TRUE ❌ (York matches, but different city)

Buyer: "Paris"
OEM: "Paris, Texas"
Match: TRUE ⚠️ (May or may not be desired)
```

**Better Logic:**

```typescript
// 3. Location match (15 points)
if (criteria.location && oem.organizations?.location) {
  const buyerLocation = criteria.location.toLowerCase().trim();
  const oemLocation = oem.organizations.location.toLowerCase().trim();

  // Exact match
  if (buyerLocation === oemLocation) {
    score += 15;
    reasons.push(`Located in ${oem.organizations.location}`);
  }
  // Same city (contains both ways, but only if significant length)
  else if (
    (oemLocation.includes(buyerLocation) ||
      buyerLocation.includes(oemLocation)) &&
    Math.min(buyerLocation.length, oemLocation.length) >= 4
  ) {
    score += 12;
    reasons.push(`Near ${oem.organizations.location}`);
  }
  // Same country (Thailand specific)
  else if (
    buyerLocation.includes("thailand") &&
    oemLocation.includes("thailand")
  ) {
    score += 10;
    reasons.push(`Domestic manufacturer in Thailand`);
  }
}
```

**Impact:**

- 🟡 Some false positive location matches
- 🟡 "York" matching "New York" is misleading
- 🟡 Minor issue but affects match quality

---

## 📋 Summary

| Severity    | Total | Fixed ✅ | Remaining ⚠️ | Issues                                                               |
| ----------- | ----- | -------- | ------------ | -------------------------------------------------------------------- |
| 🔴 Critical | 2     | 1        | 1            | ~~Industry score~~, Duplicate review bypass                          |
| 🟠 High     | 3     | 2        | 1            | ~~MOQ logic~~, ~~Transaction rollback~~, Helpful vote race condition |
| 🟡 Medium   | 2     | 0        | 2            | Scale always awarded, Location substring false positives             |
| **Total**   | **7** | **3**    | **4**        | **3 Fixed (Industry, MOQ, Rollback), 4 Remaining**                   |

---

## 🎯 Priority Fix Order

### Must Fix Before Production (Critical)

1. ⚠️ Fix duplicate review check - enforce one review per buyer-OEM pair
2. ✅ **FIXED** - Industry validation added to `calculateMatchScore()` function

### Should Fix Soon (High)

3. ⚠️ Add database trigger for helpful_count or use atomic operations (SKIPPED - no migrations)
4. ✅ **FIXED** - MOQ scoring else-if logic corrected
5. ✅ **FIXED** - Transaction/rollback added to onboarding flow

### Can Fix Later (Medium)

6. ⚠️ Improve scale compatibility scoring
7. ⚠️ Better location matching (avoid false positives)

---

## 🧪 Recommended Testing

Add unit tests for:

1. ✅ `calculateMatchScore()` with various industry combinations - FIXED (now validates industry match)
2. Duplicate review prevention
3. ✅ MOQ overlap edge cases (min/max null values) - FIXED
4. Concurrent helpful votes
5. Scale matching logic
6. Location string matching

---

**Overall Assessment:** Found 7 logic bugs, **3 bugs fixed (Industry validation, MOQ logic, Transaction rollback)**, 4 remain. Only 1 critical issue remains (duplicate reviews). The matching algorithm is now more robust with proper validation.
