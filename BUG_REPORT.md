# YumYum Project - Bug Report

**Generated:** October 29, 2025  
**Status:** Production Build ✅ Passing

## 🐛 Critical Issues (0)

No critical bugs found.

---

## ⚠️ High Priority Issues (3)

### 1. **Review Creation Missing Order ID Validation**

**File:** `components/CreateReviewDialog.tsx`  
**Line:** 64-75  
**Severity:** High  
**Issue:** Review form doesn't include `orderId` field, but backend expects it for verified purchase badges.

**Current Code:**

```tsx
const data: CreateReviewPayload = {
  oemOrgId,
  rating,
  qualityRating,
  communicationRating,
  deliveryRating,
  serviceRating,
  title,
  reviewText,
};
```

**Missing:** `orderId` field to link review to actual orders

**Impact:**

- All reviews will be unverified
- Cannot prevent duplicate reviews per order
- Missing "Verified Purchase" badges

**Fix Required:**

```tsx
type CreateReviewPayload = {
  oemOrgId: string;
  orderId?: string; // Optional - for verified purchases
  rating: number;
  // ... rest of fields
};

// Add order selector in dialog
<Select onValueChange={(value) => setOrderId(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Select Order (Optional)" />
  </SelectTrigger>
  <SelectContent>
    {orders.map((order) => (
      <SelectItem key={order.id} value={order.id}>
        Order #{order.id.slice(0, 8)} - {order.oemName}
      </SelectItem>
    ))}
  </SelectContent>
</Select>;
```

---

### 2. **Duplicate Review Prevention Not Working Client-Side**

**File:** `components/CreateReviewDialog.tsx`  
**Severity:** High  
**Issue:** No client-side check to prevent users from trying to submit duplicate reviews

**Current Behavior:**

- User can fill out entire form
- Click submit
- Get error from server: "You have already reviewed this OEM"
- Bad UX - wasted time

**Fix Required:**

```tsx
// Add query to check existing reviews
const { data: existingReview } = useQuery({
  queryKey: ["buyer-review", oemOrgId],
  queryFn: async () => {
    const res = await fetch(`/api/reviews?oemOrgId=${oemOrgId}`);
    return res.json();
  },
  enabled: open,
});

// Show warning if review exists
{
  existingReview && (
    <Alert variant="warning">
      You've already reviewed this OEM. You can edit your existing review
      instead.
    </Alert>
  );
}
```

---

### 3. **Console.error Calls in Production Code**

**Files:** Multiple service files  
**Severity:** Medium-High  
**Issue:** Using `console.error` and `console.warn` directly instead of proper logger

**Affected Files:**

- `domain/reviews/service.ts` (8 instances)
- `domain/requests/service.ts` (2 instances)
- `domain/matching/service.ts` (2 instances)
- `domain/buyers/service.ts` (5 instances)
- `app/results/page.tsx` (1 instance)
- `app/dashboard/buyer/page.tsx` (1 instance)

**Current:**

```tsx
console.error("review_create_failed", reviewError);
```

**Should Be:**

```tsx
import { logger } from "@/utils/logger";
logger.error("review_create_failed", reviewError);
```

**Impact:**

- Console logs in production bundle
- Harder to control log levels in production
- Security risk - may expose sensitive data in browser console

---

## 🔧 Medium Priority Issues (5)

### 4. **Missing Form Validation in CreateReviewDialog**

**File:** `components/CreateReviewDialog.tsx`  
**Severity:** Medium  
**Issue:** No validation before submission

**Missing Validations:**

- Title required (or at least min length)
- Review text required (min 10 characters)
- Rating cannot be 0
- Prevent submission if form invalid

**Fix:**

```tsx
const canSubmit =
  title.trim().length > 0 && reviewText.trim().length >= 10 && rating > 0;

<Button type="submit" disabled={!canSubmit || createReviewMutation.isPending}>
  Submit Review
</Button>;
```

---

### 5. **ReviewsList Component Doesn't Handle Empty Category Averages**

**File:** `components/ReviewsList.tsx`  
**Line:** 152  
**Severity:** Medium  
**Issue:** When showing category ratings (Quality, Communication, Delivery, Service), if a rating is `null`, it shows nothing but still takes up space

**Current:**

```tsx
{
  [
    { label: "Quality", value: review.qualityRating },
    // ...
  ].map(({ label, value }) => (value ? <div key={label}>...</div> : null));
}
```

**Problem:** Grid layout breaks when some ratings are null

**Fix:**

```tsx
// Only show if at least one category rating exists
const hasCategoryRatings =
  review.qualityRating ||
  review.communicationRating ||
  review.deliveryRating ||
  review.serviceRating;

{
  hasCategoryRatings && (
    <div className="grid grid-cols-4 gap-4">{/* ... */}</div>
  );
}
```

---

### 6. **Race Condition in Match Digest Parsing**

**File:** `app/dashboard/buyer/page.tsx`  
**Line:** 443-457  
**Severity:** Medium  
**Issue:** Digest parsing has try-catch but swallows all errors silently

**Current:**

```tsx
try {
  const digestData = match.digest as Record<string, unknown>;
  if (digestData.reasons && Array.isArray(digestData.reasons)) {
    matchReasons.push(...digestData.reasons);
  }
} catch (e) {
  console.warn("Failed to parse digest:", e);
}
```

**Problem:** Silent failure - user sees generic reasons instead of actual match reasons

**Fix:**

```tsx
try {
  const digestData = match.digest as Record<string, unknown>;
  if (digestData.reasons && Array.isArray(digestData.reasons)) {
    matchReasons.push(...digestData.reasons);
  } else if (digestData.reasons) {
    // Log unexpected format for debugging
    logger.warn("Digest reasons not an array:", {
      matchId: match.id,
      type: typeof digestData.reasons,
    });
  }
} catch (e) {
  logger.error("Digest parse error:", { matchId: match.id, error: e });
}
```

---

### 7. **OEM Profile Page Missing Null Check for Rating**

**File:** `app/oem/[slug]/page.tsx`  
**Line:** 285  
**Severity:** Medium  
**Issue:** Rating display assumes `profile.rating` exists

**Current:**

```tsx
{
  typeof profile.rating === "number" && (
    <div className="flex items-center gap-1">
      <Star className="h-4 w-4 fill-primary text-primary" />
      <span className="font-semibold text-foreground">
        {profile.rating.toFixed(1)}
      </span>
      <span>({profile.total_reviews ?? 0} reviews)</span>
    </div>
  );
}
```

**Problem:** If rating is 0 (valid rating), this won't display

**Fix:**

```tsx
{
  profile.rating !== null && profile.rating !== undefined && (
    <div className="flex items-center gap-1">
      <Star className="h-4 w-4 fill-primary text-primary" />
      <span className="font-semibold text-foreground">
        {profile.rating.toFixed(1)}
      </span>
      <span>({profile.total_reviews ?? 0} reviews)</span>
    </div>
  );
}
```

---

### 8. **Helpful Vote Toggle Missing Optimistic Update**

**File:** `components/ReviewsList.tsx`  
**Line:** 82-95  
**Severity:** Low-Medium  
**Issue:** When marking review helpful, UI doesn't update until server responds

**Current Behavior:**

- Click "Helpful" button
- Wait for server
- Count updates

**Better UX:**

```tsx
const markHelpfulMutation = useMutation({
  mutationFn: async (reviewId: string) => {
    // ... existing code
  },
  onMutate: async (reviewId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["oem-reviews", oemOrgId] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(["oem-reviews", oemOrgId]);

    // Optimistically update
    queryClient.setQueryData(["oem-reviews", oemOrgId], (old: any) => {
      return {
        ...old,
        data: old.data.map((r: ReviewResponse) =>
          r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
        ),
      };
    });

    return { previous };
  },
  onError: (err, reviewId, context) => {
    // Rollback on error
    queryClient.setQueryData(["oem-reviews", oemOrgId], context?.previous);
  },
});
```

---

## 🔍 Low Priority Issues (4)

### 9. **Missing Loading States in ReviewsList**

**File:** `components/ReviewsList.tsx`  
**Issue:** Generic "Loading reviews..." text, no skeleton loader

**Enhancement:**

```tsx
{isLoading ? (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <Card key={i} className="p-6">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-20 w-full" />
      </Card>
    ))}
  </div>
) : (
  // ... reviews
)}
```

---

### 10. **No Error Boundary for Review Components**

**Files:** `components/ReviewsList.tsx`, `components/CreateReviewDialog.tsx`  
**Issue:** If review component crashes, entire page crashes

**Fix:** Wrap in ErrorBoundary

```tsx
<ErrorBoundary fallback={<ReviewsErrorFallback />}>
  <ReviewsList oemOrgId={organization.id} />
</ErrorBoundary>
```

---

### 11. **Hardcoded Pagination Limit**

**File:** `components/ReviewsList.tsx`  
**Line:** 62  
**Issue:** `limit=20` is hardcoded, no "Load More" functionality

**Enhancement:**

```tsx
const [limit, setLimit] = useState(20);

// Add Load More button
{
  reviews.length < total && (
    <Button onClick={() => setLimit((prev) => prev + 20)}>
      Load More Reviews ({total - reviews.length} remaining)
    </Button>
  );
}
```

---

### 12. **Missing Analytics Events**

**Files:** All review components  
**Issue:** No tracking for review submissions, helpful votes, etc.

**Enhancement:**

```tsx
// After successful review submission
analytics.track("review_submitted", {
  oemId: oemOrgId,
  rating,
  hasOrder: !!orderId,
});
```

---

## 📊 Code Quality Metrics

### Build Status

✅ **Production Build:** Passing  
✅ **Type Checking:** No errors  
✅ **ESLint:** Only minor markdown linting warnings

### Test Coverage

⚠️ **No automated tests detected**

**Recommendation:** Add tests for:

- Review creation flow
- Match generation algorithm
- API routes (especially reviews CRUD)
- Rating calculation triggers

---

## 🎯 Recommendations Priority

### Immediate (Before Launch)

1. ✅ Fix review form to include orderId
2. ✅ Add client-side duplicate review check
3. ✅ Replace console.error with logger

### Short Term (Week 1)

4. Add form validation to CreateReviewDialog
5. Fix category ratings display in ReviewsList
6. Add error boundaries

### Medium Term (Month 1)

7. Implement optimistic updates for helpful votes
8. Add pagination/load more for reviews
9. Add loading skeletons
10. Set up basic analytics tracking

### Long Term (Ongoing)

11. Write unit tests (target 80% coverage)
12. Set up E2E tests for critical flows
13. Performance monitoring
14. A/B testing for match algorithm

---

## ✅ What's Working Well

1. **Type Safety:** Excellent TypeScript coverage
2. **Database Schema:** Well-designed with triggers for auto-updates
3. **API Design:** RESTful, consistent error handling
4. **Matching Algorithm:** Sophisticated 7-factor scoring
5. **Build Process:** Fast, optimized production builds
6. **Review System:** Comprehensive with category ratings, verification

---

## 🚀 Next Steps

1. Create GitHub issues for each bug above
2. Prioritize fixes based on severity
3. Add unit tests as you fix bugs
4. Consider setting up staging environment for testing
5. Add Sentry or similar for production error tracking

**Overall Assessment:** Project is in good shape! No critical blockers for launch, but should address high-priority issues before production release.
