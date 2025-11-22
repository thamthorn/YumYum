Plan: OEM Platform Enhancement with 3-Tier Subscription System
This plan transforms YumYum into a comprehensive OEM matching platform with tiered subscriptions (Free, Insights, Verified Partner), complete OEM onboarding with product/certification uploads, enhanced matching with AI-powered analysis, and differentiated user experiences based on login status and subscription level.

---

## Part 1: Page Details

### 1.1 หน้า OEM Registration & Company Profile Setup

#### Pages Required:

- `/onboarding/oem/page.tsx` - Multi-step OEM registration wizard
- `/dashboard/oem/profile/page.tsx` - OEM profile management
- `/dashboard/oem/products/page.tsx` - Product catalog management
- `/dashboard/oem/certifications/page.tsx` - Certification upload & management
- `/dashboard/oem/media/page.tsx` - Photo/video gallery management
- `/dashboard/oem/subscription/page.tsx` - Tier selection & payment

#### 1.1.1 ลงทะเบียนบริษัท (Company Registration)

**Required Fields:**

- Company Name (Thai) - `company_name_th`
- Company Name (English) - `company_name_en`
- Address - `address`
- Country - `country`
- Website - `website`
- Contact Person - `contact_person`
- Email - `email`
- Phone - `phone`
- Line / WeChat (optional) - `line_id`, `wechat_id`

**Database Changes:**

- Add to `oem_profiles` table: `company_name_th`, `line_id`, `wechat_id`

---

### 1.2 อัปโหลดสินค้า (Product Upload)

#### Per Product Fields:

- Product name - `name`
- Product type / Category - `category_id`
- Photos (1–5 รูป) - `product_images` table
- Description - `description`
- MOQ เฉพาะสินค้านั้น - `moq`
- Estimated lead time - `lead_time_days`
- Price range (optional) - `price_min`, `price_max`

**Database Changes:**

- Extend `products` table with: `lead_time_days`, `price_min`, `price_max`
- Create `product_images` table: `product_id`, `image_url`, `display_order`

---

### 1.3 Capability เบื้องต้น (OEM Capabilities)

#### Checkbox / Multi-select Fields:

- Product categories - Multi-select from `product_categories` table
- R&D available? - `has_rd`
- Packaging service? - `has_packaging`
- Formula library available? - `has_formula_library`
- White-label available? - `has_white_label`
- Export experience? - `has_export_experience`
- Languages supported - `languages` (array/jsonb)

**Database Changes:**

- Create `oem_capabilities` table:
  ```sql
  - oem_id (FK)
  - has_rd (boolean)
  - has_packaging (boolean)
  - has_formula_library (boolean)
  - has_white_label (boolean)
  - has_export_experience (boolean)
  - languages (text[])
  ```

---

### 1.4 Certifications

#### Upload PDF or List:

- GMP
- ISO 9001
- ISO 22716
- Halal
- Organic Cert
- Others

**Database Changes:**

- Extend `oem_certifications` join table:
  ```sql
  - oem_id (FK)
  - certification_type (enum: 'GMP', 'ISO_9001', 'ISO_22716', 'HALAL', 'ORGANIC', 'OTHER')
  - file_url (text)
  - expiry_date (date, optional)
  - verified (boolean)
  ```

---

### 1.5 Minimum Order Qty (Global)

#### Category-Specific MOQ:

- MOQ for skincare - `moq_skincare`
- MOQ for haircare - `moq_haircare`
- MOQ for supplements - `moq_supplements`
- MOQ for make-up - `moq_makeup`

**Note:** ระบบรองรับทั้ง Global MOQ และ MOQ เฉพาะสินค้า

**Database Changes:**

- Add to `oem_profiles` table: `moq_skincare`, `moq_haircare`, `moq_supplements`, `moq_makeup`

---

### 1.6 Categories (Multi-select)

#### Available Categories:

- Skincare
- Supplement
- Makeup
- Haircare
- Perfume
- Household
- Food/Beverage
- Others

**Database Structure:**

- Uses existing `oem_services` join table pattern
- Many-to-many relationship: `oem_profiles` ↔ `product_categories`

---

### 1.7 Tier System / Subscription

#### 3 Tiers:

**Verified Partner (Tier 3) - ฿9,999/mo + inspection fee**

- ✅ Verified OEM badge
- ✅ Insights Pro (detailed analytics)
- ✅ Factory inspection & compliance check
- ✅ Factory Tour Video upload
- ✅ QC Process Video upload
- ✅ Rank boost in search results
- ✅ Profile views, keyword insights, competitor analysis
- ✅ Export data (PDF/CSV)
- ✅ Drill-down analytics

**Insights (Tier 2) - ฿2,999/mo**

- ✅ Premium insights (basic analytics)
- ✅ Profile views (monthly summary)
- ✅ Keyword traffic (top 10)
- ✅ Trend report (category-level)
- ✅ Competitor overview (max 3)
- ✅ Basic CSV export
- ❌ No verification
- ❌ No drill-down/interactive filters

**Free (Tier 1) - ฿0**

- ✅ Basic listing
- ✅ Product catalog
- ❌ No analytics
- ❌ No insights
- ❌ No verification

**Database Changes:**

- Create `subscriptions` table:
  ```sql
  - id
  - oem_id (FK)
  - tier (enum: 'FREE', 'INSIGHTS', 'VERIFIED_PARTNER')
  - status (enum: 'ACTIVE', 'CANCELLED', 'PENDING')
  - stripe_subscription_id
  - current_period_start
  - current_period_end
  - created_at
  - updated_at
  ```
- Create `inspection_bookings` table:
  ```sql
  - id
  - oem_id (FK)
  - scheduled_date
  - status (enum: 'PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED')
  - inspector_id (nullable)
  - report_url (nullable)
  - notes (text, nullable)
  - created_at
  - updated_at
  ```

---

### 1.8 หน้า Brand/User - Input Form สำหรับทำ Matching

#### Page:

- `/` or `/matching/page.tsx` - Matching form with AI analysis

#### Input Fields (Brand/User ใส่ข้อมูล):

- Product category - `category_id` (dropdown)
- Target price range - `target_price_min`, `target_price_max`
- Volume (pcs) - `volume`
- Certifications needed - `required_certifications` (multi-select)
- Preferred lead time - `preferred_lead_time_days`
- Country preference (optional) - `preferred_country`
- Additional requirements (text) - `additional_requirements` → **AI parses using `/api/ai-search`**

#### UX Flow:

- **Guest users:** Can see form BUT get **"Please login to match"** modal on submit
- **Logged-in users:** Proceed to matching results immediately

---

### 1.9 Matching Logic (Scoring Algorithm)

#### Matching Criteria (Priority Order):

1. **Category** (must match) - Score: 40%
2. **MOQ** (OEM's MOQ ≤ User's volume) - Score: 25%
3. **Lead time** - Score: 15%
4. **Certifications** - Score: 10%
5. **Price range** - Score: 5%
6. **Verified Tier** (ranking boost) - Score: 5%

**Algorithm Enhancement:**

- Reuse existing `domain/matching/match-oem.ts`
- Add weighted scoring based on above criteria
- Verified Partner gets +10 bonus points
- AI parses `additional_requirements` for semantic matching

---

### 1.10 หน้า List OEM ที่เหมาะสม (Matching Results)

#### Pages:

- `/results/page.tsx` - Search results (matching results)
- `/oems/page.tsx` - Browse all OEMs

#### Display Fields:

- OEM Name - `company_name_en`
- Location - `country`
- Category Strength - Based on product count per category
- MOQ - `moq_*` fields
- Lead time - `lead_time_days`
- Certifications - Badge icons (GMP, ISO, Halal, etc.)
- **Tier badge** - Verified Partner shows **"Verified"** with premium styling
- Rating/Reviews (optional, future phase)
- **Match Score (%)** - Calculated from matching algorithm
- **Video (Verified Partner only):**
  - On hover: Video thumbnail preview (like YouTube)
  - Other tiers: Static image only

#### Access Control:

**Guest (Not Logged In) - CAN SEE:**

- OEM name
- Tier badge
- Category (general)
- Logo
- Location
- Product thumbnails (limited)

**Guest (Not Logged In) - CANNOT SEE:**

- Detailed MOQ per product
- Lead time specifics
- Price ranges
- Advanced filters (cert, lead time, tier filters)
- Full product list
- Contact/Send RFQ button (disabled)
- **Matching form is visible BUT blocked on submit**

**Logged-In User - CAN SEE/DO:**

- All guest fields +
- Detailed MOQ, lead time, price range
- Match score %
- Advanced filters
- Click through to OEM profiles
- Save OEMs (uses existing `saved_oems` table)
- Send RFQ / Contact button enabled

---

### 1.11 OEM Profile Page (Enhanced)

#### Page:

- `/oem/[slug]/page.tsx` - Public & Admin view

#### Public View (Customer-Facing):

- Banner + Logo
- **Verified Badge** (Verified Partner only)
- **Factory Tour Video** (Verified Partner only) - YouTube/Vimeo embed or Supabase Storage
- **QC Process Video** (Verified Partner only)
- Company Description
- **Capabilities Grid** (from `oem_capabilities` table)
- **Certifications** with downloadable PDFs (watermarked)
- **Product Catalog** with category filters
- **Contact/RFQ Button** (disabled for guests)

#### Admin View (OEM Owner):

- Toggle: **"Switch to Public View"** / **"Switch to Edit Mode"**
- Inline edit buttons on each section
- Add/delete products, photos, videos
- Live preview before save
- Auto-save drafts (new `oem_profile_drafts` table)

---

### 1.12 Insight Page (OEM - Tier 2 & 3 Only)

#### Page:

- `/dashboard/oem/insights/page.tsx`

#### Verified Partner (Tier 3) - Full Analytics:

**Top Section: Summary Cards**

- Profile views (last 30 days)
- Top 5 keywords driving traffic
- Trend spike alerts
- Match score average

**Middle Section: Interactive Charts**

- Line chart: Profile views over time
- Bar chart: Keyword traffic breakdown
- Heatmap: Category interest by region
- Funnel: View → Contact → RFQ conversion

**Bottom Section:**

- Competitor leaderboard (top 5 in same category)
- Export buttons (PDF/CSV)
- Email alert settings
- **Drill-down:** Click any metric → detailed modal

#### Insights (Tier 2) - Basic Analytics:

**Top Section: Summary Cards** (same data, no drill-down)

**Middle Section: Simple Charts**

- Profile views (monthly bars only)
- Top 10 keywords (static table)
- Category interest (pie chart)

**Bottom Section:**

- Competitor overview (max 3, no ranking)
- Basic CSV export
- ❌ No alerts, no drill-down

#### Free (Tier 1):

- ❌ No access - Redirect to upgrade page

**Database Requirements:**

- Create `oem_analytics_events` table:
  ```sql
  - id
  - oem_id (FK)
  - event_type (enum: 'PROFILE_VIEW', 'CONTACT_CLICK', 'RFQ_SENT', 'PRODUCT_VIEW')
  - user_id (FK, nullable)
  - metadata (jsonb)
  - created_at
  ```
- Create `oem_keyword_traffic` table:
  ```sql
  - id
  - oem_id (FK)
  - keyword
  - count
  - date
  ```
- Scheduled job: Daily aggregation of stats

---

## Part 2: User & OEM Flow

### 2.1 Brand/Buyer User Flow

#### 2.1.1 User Home Page (After Login)

**Page:** `/` or `/dashboard/buyer/page.tsx`

**Layout Structure:**

The home page is divided into **2 main sections**:

##### Section 1: Matching Panel (Top Half - Hero Section)

**Visual Design:**

- Large centered box with gradient background
- Heading: **"Find your OEM match"**
- Subheading: Short description of AI-powered matching
- Primary CTA button: **"Start Matching"**

**Feature Icons (3 columns below button):**

- 🤖 **AI Matching** - "Smart algorithm finds your perfect OEM"
- ⚡ **Quick filters** - "Filter by MOQ, lead time, certifications"
- ✅ **Verified OEM priority** - "Inspected factories ranked higher"

**User Flow:**

```
User clicks "Start Matching"
  → Redirects to `/matching` page (matching form)
```

##### Section 2: Category Explorer (Bottom Half)

**Visual Design:**

- Grid layout (3-4 columns on desktop, 2 on tablet, 1 on mobile)
- Beautiful category cards with hero images

**Categories:**

- 🧴 Skincare
- 💊 Supplement
- 💄 Makeup
- 💇 Haircare
- 🌸 Perfume
- 🏠 Household
- 🍽️ Food/Beverage
- 📦 Others

**User Flow:**

```
User clicks on a category (e.g., "Skincare")
  → Redirects to `/oems?category=skincare` (OEM list page with pre-filtered category)
```

##### Header Navigation (Top Right)

**Elements:**

- User avatar/photo
- Username dropdown menu:
  - ⚙️ Settings
  - 💾 Saved OEMs (shows `saved_oems` count badge)
  - 💬 Support
  - 🚪 Logout

---

#### 2.1.2 Matching Page (Input Form)

**Page:** `/matching/page.tsx`

**Access Control:**

- ✅ **Logged-in users:** Can access and submit form
- ❌ **Guest users (not logged in):**
  - Can SEE the form
  - On submit → Popup modal: **"Please login to use Matching"**
  - Modal has **"Login"** and **"Sign up"** buttons

##### Form Fields:

**1. Product Category** (Dropdown - Required)

- Options: Skincare, Supplement, Makeup, Haircare, Perfume, Household, Food/Beverage, Others

**2. Target Price Range** (Two number inputs)

- Min price (฿)
- Max price (฿)

**3. Volume (pcs)** (Number input - Required)

- Placeholder: "e.g., 1000"

**4. Required Certifications** (Multi-select checkboxes)

- Options:
  - ✅ GMP
  - ✅ ISO 9001
  - ✅ ISO 22716
  - ✅ Halal
  - ✅ Organic
  - ✅ FDA (Thailand)
  - ✅ Other (text input appears)

**5. Preferred Lead Time** (Dropdown)

- Options: "1-2 weeks", "2-4 weeks", "1-2 months", "2-3 months", "Flexible"

**6. Country Preference** (Dropdown - Optional)

- Options: Thailand, Vietnam, China, Japan, South Korea, Taiwan, Malaysia, Indonesia, India, "No preference"

**7. Additional Requirements** (Textarea)

- Placeholder: "e.g., Need eco-friendly packaging, R&D support, formula customization..."
- **AI Processing:** Text is sent to `/api/ai-search` for semantic matching

##### Submit Button:

- Text: **"Match Now"** or **"Find My OEM"**
- Action:

  ```
  If user is logged in:
    → Submit form data to matching algorithm
    → Redirect to `/results?matching=true` (Matching Results page)

  If user is NOT logged in:
    → Show popup modal: "Please login to use Matching"
  ```

---

#### 2.1.3 Matching Results Page (List View)

**Page:** `/results/page.tsx?matching=true`

**Top Section:**

- Heading: **"Your Best OEM Matches"**
- Subheading: "Based on your requirements, we found X matching OEMs"
- Sort options (Dropdown):
  - 🏆 Best match (default)
  - ⚡ Fastest lead time
  - 💰 Lowest MOQ
  - ⭐ Highest rated (future phase)

**OEM Cards (List):**

Each card displays:

##### Card Layout:

**Left Section (30%):**

- OEM Logo (square, 120x120px)
- **Tier Badge** (overlay on logo)
  - Free: Gray badge "Free"
  - Insights: Blue badge "Insights" with 📊 icon
  - Verified Partner: Gold badge "✅ Verified" (premium styling with gradient/glow)

**Middle Section (50%):**

- **Company Name** (h3, clickable → goes to OEM profile)
- **Location:** 📍 Country
- **Categories:** Tags (e.g., "Skincare", "Haircare")
- **Match Score:** Large percentage badge (e.g., "95% Match" in green)
- **MOQ:** "Minimum Order: 1,000 pcs"
- **Lead Time:** "⏱️ 2-4 weeks"
- **Certifications:** Icon badges (GMP, ISO, Halal, etc.)

**Right Section (20%):**

- **Verified Partner Only:**
  - Video thumbnail preview (Factory Tour)
  - On hover: Play icon appears
  - Click → Opens video modal or inline player
- **Other Tiers:**
  - Static product image (no video)

##### Card Actions:

**Bottom of card:**

- **Primary Button:** "View Profile" (→ `/oem/[slug]`)
- **Secondary Button:** "💾 Save" (adds to `saved_oems` table)
  - If already saved: "❤️ Saved" (filled heart, can unsave)

---

#### 2.1.4 Browse OEM List Page (Category-Based)

**Page:** `/oems/page.tsx` or `/oems?category=skincare`

**Access Control:**

##### Guest Users (Not Logged In) - **CAN SEE:**

- OEM name
- Tier badge (visual only, no hover tooltip)
- Category tags (general)
- Logo
- Location (country only)
- Product thumbnails (2-3 images max)

##### Guest Users (Not Logged In) - **CANNOT SEE:**

- Detailed MOQ per product
- Lead time specifics
- Price ranges (hidden/blurred)
- Advanced filters:
  - ❌ Filter by certification
  - ❌ Filter by lead time
  - ❌ Filter by tier
- Full product list (some products hidden)
- **Contact/Send RFQ button is DISABLED** (grayed out)
  - Tooltip on hover: "Login to contact OEMs"

**Message Banner for Guests:**

- Top of page: Yellow/info banner
- Text: **"🔒 Login to view full details and contact OEMs"**
- CTA button: "Login Now"

---

##### Logged-In Users - **CAN SEE/DO:**

**Everything guests see, PLUS:**

- ✅ Detailed MOQ per product
- ✅ Lead time (days/weeks)
- ✅ Price ranges (if available)
- ✅ Match score % (if came from matching)
- ✅ Advanced filters panel (left sidebar or top)
- ✅ Full product catalog
- ✅ **Contact/Send RFQ button ENABLED**
- ✅ **Save OEM button** (heart icon)

##### Filters (Logged-In Users Only):

**Left Sidebar or Top Bar:**

- **Category** (multi-select)
- **Tier** (checkboxes: Free, Insights, Verified Partner)
- **Certifications** (checkboxes: GMP, ISO, Halal, etc.)
- **Lead Time** (range slider: 1-12 weeks)
- **MOQ Range** (number inputs: min-max)
- **Country** (dropdown multi-select)
- **Sort By** (dropdown):
  - Relevance
  - Verified first
  - Lowest MOQ
  - Fastest lead time

##### OEM Card Display (Similar to Matching Results):

**Each card shows:**

- Logo + Tier badge
- Company name (clickable)
- Location
- Categories
- MOQ (if logged in)
- Lead time (if logged in)
- Certifications (icon badges)
- Price range (if logged in and available)
- **Verified Partner:** Video thumbnail (factory tour) on hover
- **Other Tiers:** Static image

**Card Actions:**

- **"View Profile"** button → `/oem/[slug]`
- **"💾 Save"** button (logged in only)
- **"Send RFQ"** button (logged in only)

---

#### 2.1.5 OEM Profile Page (Public View - Customer-Facing)

**Page:** `/oem/[slug]/page.tsx`

**Access Control:**

- ✅ **Public page** - Anyone can view (guests + logged-in)
- ❌ **Guest users:** Cannot click "Contact" or "Send RFQ" buttons
- ✅ **Logged-in users:** Can contact, send RFQ, save OEM

##### Page Sections:

**1. Hero Section (Banner + Logo)**

- Full-width banner image (factory photo or branded banner)
- Company logo (overlaid on banner, bottom-left)
- **Verified Badge** (top-right corner) - Verified Partner only
  - Badge text: "✅ Verified Partner"
  - Tooltip: "Factory inspected on [date]"

**2. Company Overview**

- **Company Name** (h1)
- **Location:** 📍 Country, City
- **Established:** Year founded
- **Contact Info** (logged-in users only):
  - 📧 Email
  - 📞 Phone
  - 💬 Line / WeChat ID
- **Website:** Link (external)

**3. Videos Section (Verified Partner Only)**

**Factory Tour Video:**

- Embedded player (YouTube/Vimeo or Supabase Storage)
- Title: "🏭 Factory Tour"
- Duration shown

**QC Process Video:**

- Title: "✅ Quality Control Process"
- Embedded player

**If NOT Verified Partner:**

- This section is hidden

**4. Capabilities Grid**

**Data from:** `oem_capabilities` table

**Grid Layout (Icon + Text):**

- ✅ R&D Available
- 📦 Packaging Service
- 🧪 Formula Library
- 🏷️ White-label / OEM/ODM
- 🌍 Export Experience
- 🗣️ Languages: English, Thai, Chinese, Japanese

**5. Certifications Section**

**Title:** "📜 Certifications & Compliance"

**Display:**

- List of certification badges (with icons):
  - GMP
  - ISO 9001
  - ISO 22716
  - Halal
  - Organic
  - FDA (Thailand)
  - Others

**For each certification:**

- Badge icon
- Certification name
- Expiry date (if applicable)
- **Download PDF button** (downloads watermarked file)
  - Watermark: "For reference only - [Date]"

**6. Product Catalog**

**Title:** "🛍️ Our Products"

**Filters (Top bar):**

- Category tabs: All / Skincare / Haircare / Supplements / Makeup
- Sort: Newest / Popular / Low MOQ

**Product Cards (Grid):**

Each card shows:

- Product photo
- Product name
- Category tag
- **MOQ:** (logged-in users only)
- **Lead time:** (logged-in users only)
- **Price range:** (logged-in users only, if available)

**Click on product card:**

- Opens modal/drawer with full product details
- Shows 1-5 product photos (carousel)
- Full description
- Specifications
- MOQ, lead time, price

**7. Contact/RFQ Section (Bottom CTA)**

**For Logged-In Users:**

- Large CTA button: **"Send RFQ (Request for Quotation)"**
- Secondary button: **"💾 Save OEM"**

**For Guest Users:**

- Buttons are **DISABLED** (grayed out)
- Tooltip: "Please login to contact this OEM"
- Banner message: "🔒 Login to send inquiries and contact OEMs"

---

#### 2.1.6 Saved OEMs Page

**Page:** `/dashboard/buyer/saved-oems/page.tsx`

**Purpose:** Users can see all OEMs they've saved for future reference

**Content:**

- List of saved OEMs (similar card layout to browse page)
- Each card has:
  - OEM info (name, logo, tier, location)
  - Date saved
  - **"Unsave"** button (heart icon filled → unfilled)
  - **"View Profile"** button
  - **"Send RFQ"** button

**Empty State:**

- Message: "You haven't saved any OEMs yet"
- CTA button: "Browse OEMs" → `/oems`

---

#### 2.1.7 User Flow Summary (Diagram)

```
┌─────────────────────────────────────────────────────────┐
│                    HOME PAGE (/)                         │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │   MATCHING PANEL (Top Half)                 │        │
│  │   "Find your OEM match"                     │        │
│  │   [Start Matching Button]                   │        │
│  └────────────────────────────────────────────┘        │
│                        ↓                                 │
│              Clicks "Start Matching"                     │
│                        ↓                                 │
│  ┌────────────────────────────────────────────┐        │
│  │   CATEGORY EXPLORER (Bottom Half)           │        │
│  │   [Skincare] [Supplement] [Makeup]          │        │
│  │   [Haircare] [Perfume] [Food] [Others]      │        │
│  └────────────────────────────────────────────┘        │
│                        ↓                                 │
│              Clicks a category                           │
└─────────────────────────────────────────────────────────┘
                         ↓
         ┌───────────────┴───────────────┐
         ↓                               ↓
┌──────────────────┐          ┌──────────────────┐
│ MATCHING PAGE    │          │ BROWSE OEMs PAGE │
│ /matching        │          │ /oems?category=X │
│                  │          │                  │
│ [Fill Form]      │          │ Guest: Limited   │
│                  │          │ Logged-in: Full  │
│ Click "Match"    │          │                  │
│   ↓              │          │ [Filter Panel]   │
│ If NOT logged in:│          │ [OEM Cards]      │
│ → Popup: Login   │          └──────────────────┘
│                  │                    ↓
│ If logged in:    │          Click "View Profile"
│ → Matching Results│                   ↓
└──────────────────┘          ┌──────────────────┐
         ↓                     │ OEM PROFILE PAGE │
┌──────────────────┐          │ /oem/[slug]      │
│ RESULTS PAGE     │          │                  │
│ /results         │          │ • Hero Banner    │
│                  │          │ • Videos (Verified)│
│ • Match Score %  │          │ • Capabilities   │
│ • OEM Cards      │          │ • Certifications │
│ • Sort/Filter    │◄─────────│ • Products       │
│                  │          │ • Contact CTA    │
│ Click OEM card   │          │                  │
│   ↓              │          │ Guest: Contact   │
└──────────────────┘          │ disabled         │
         │                     │ Logged-in: Full  │
         │                     └──────────────────┘
         ↓                                ↓
┌──────────────────┐          ┌──────────────────┐
│ SAVED OEMs PAGE  │          │ Send RFQ / Save  │
│ /dashboard/buyer/│          │ (Logged-in only) │
│ saved-oems       │          └──────────────────┘
│                  │
│ • Saved OEM list │
│ • Unsave button  │
│ • View/Contact   │
└──────────────────┘
```

---

### 2.2 OEM User Flow

#### Overview

การไหลของผู้ใช้ฝั่ง OEM ครอบคลุมตั้งแต่การ "ลงทะเบียนโรงงาน" → "ตั้งค่าโปรไฟล์พื้นฐาน" → "เผยแพร่โปรไฟล์ให้ถูกค้นหา" → "สมัครสมาชิก (Subscription)" → "ตรวจโรงงาน / Verified" → "ใช้งาน Insight / Analytics". ระบบต้องบังคับลำดับ (gated progression) เพื่อให้ข้อมูลมีคุณภาพก่อนเปิดให้แสดงในหน้า OEM list / Matching.

#### Core Stages

1. Registration & Account Creation
2. Profile Setup Wizard (Products → Capabilities → Categories → Global MOQ → Certifications)
3. Company Profile Management (Admin vs Public View)
4. Subscription & Tier Upgrade Flow
5. Inspection / Verification Scheduling (Verified Partner)
6. Insights & Analytics Access (Tier-based)

#### Profile Status Lifecycle

- `UNREGISTERED` → ผู้ใช้ยังไม่สร้างบัญชี
- `REGISTERED` → สร้างบัญชีแล้ว แต่ยังไม่กรอกโปรไฟล์
- `DRAFT` → กำลังกรอก wizard ยังไม่ครบขั้นต่ำ
- `INCOMPLETE` → กรอกบางส่วน แต่ไม่ผ่าน completeness check สำหรับการแสดงในผลการค้นหา
- `ACTIVE` → ผ่านเงื่อนไขขั้นต่ำ แสดงใน OEM list / Matching
- `VERIFIED_PENDING` → จ่าย Verified Partner แล้ว รอการตรวจโรงงาน
- `VERIFIED` → ผ่านการตรวจ พร้อม Verified Badge + วิดีโอ

Completeness Minimum (ต้องมีเพื่อขึ้นเป็น ACTIVE):

- อย่างน้อย 1 product พร้อมรูป ≥1
- Company basic info ครบ (ชื่อ EN / TH, country, contact email)
- เลือก ≥1 category
- กรอก MOQ global อย่างน้อย 1 ช่อง

---

### 2.2.1 Registration Flow

**Pages / Routes:**

- `/onboarding/oem/register` (Form สมัคร)
- `/onboarding/oem/verify` (ถ้ามี email/phone OTP)
- `/login` (หลังสมัครสำเร็จ auto-login หรือ redirect login)
- `/onboarding/oem/setup` (เริ่ม wizard profile)

**Steps:**

1. OEM กดปุ่ม "ลงทะเบียนโรงงาน" จากหน้าใดก็ได้ (เช่น `/login` หรือ CTA พิเศษ)
2. กรอกข้อมูล: Email, Password, Company Name EN/TH, Country
3. (Optional) ส่ง OTP ยืนยัน Email / Phone → ถ้าไม่ทำ ยังคงเป็น `REGISTERED` แต่ระบบสามารถเตือน
4. เข้าสู่ระบบ → redirect ไป Wizard `/onboarding/oem/setup` (Profile Setup Flow)

**API Draft:**

- `POST /api/oem/auth/register` → create user + provisional `oem_profile`
- `POST /api/oem/auth/verify` → mark email/phone_verified

---

### 2.2.2 Profile Setup Wizard Flow

Wizard ลำดับชัดเจน แสดง progress bar (Products → Capabilities → Categories → MOQ → Certifications → Summary Publish)

**Routes (Suggestion):**

- `/onboarding/oem/setup/products`
- `/onboarding/oem/setup/capabilities`
- `/onboarding/oem/setup/categories`
- `/onboarding/oem/setup/moq`
- `/onboarding/oem/setup/certifications`
- `/onboarding/oem/setup/review`

**2.2.2.1 Upload Product (Step 1)**

- Fields: name, category, photos(1–5), description, product-level MOQ, lead time, price range(optional)
- Actions: Add Product / Edit / Delete / Save Draft
- Validation: อย่างน้อย 1 product เพื่อไปขั้นถัดไป
- API: `POST /api/oem/products` (create), `PUT /api/oem/products/:id`, `DELETE /api/oem/products/:id`

**2.2.2.2 Capabilities (Step 2)**

- Checkboxes: R&D, Packaging, Formula Library, White-label, Export Experience
- Languages multi-select
- API: `PUT /api/oem/capabilities`

**2.2.2.3 Categories (Step 3)**

- Multi-select จากชุด Category (Skincare, Supplement, Makeup, Haircare, Perfume, Household, Food/Beverage, Others)
- Validation: ≥1 category
- API: `PUT /api/oem/categories`

**2.2.2.4 Global MOQ (Step 4)**

- Fields: moq_skincare, moq_haircare, moq_supplements, moq_makeup (optional others future)
- API: `PUT /api/oem/profile/moq`

**2.2.2.5 Certifications (Step 5)**

- Upload PDFs: GMP, ISO9001, ISO22716, Halal, Organic, Other
- Each upload → status `UNVERIFIED` initially; admin later can flip to `verified`
- API: `POST /api/oem/certifications` (multipart), `DELETE /api/oem/certifications/:id`

**2.2.2.6 Review & Publish (Step 6)**

- Summary card: Products count, Categories selected, Capabilities, MOQ overview, Certifications uploaded
- Button: "Publish Profile" → sets status to `ACTIVE` if completeness passes else show missing checklist
- API: `POST /api/oem/profile/publish`

**Draft Persistence:** Auto-save every step (debounce 1–2s) to allow leaving wizard safely. Table: `oem_profile_drafts` (oem_id, json_blob, updated_at)

---

### 2.2.3 Company Profile Management Flow

**Primary Page:** `/dashboard/oem/profile` (Admin view default after finish wizard)
**Public Page:** `/oem/[slug]` (Customer-facing)

**Modes:**

- Edit Mode (Admin) → inline editable sections
- Public Preview toggle → see what buyers see (hide admin-only elements)

**Sidebar Navigation (Dashboard):**

- Profile (overview)
- Products (`/dashboard/oem/products`)
- Media (`/dashboard/oem/media`)
- Certifications (`/dashboard/oem/certifications`)
- Subscription (`/dashboard/oem/subscription`)
- Insights (`/dashboard/oem/insights`) – gated Tier ≥ Insights
- Inspection / Verification (`/dashboard/oem/inspection`) – visible when Tier = Verified Partner pending or after purchase

**Edit Capabilities:** Inline editing triggers modals or slide-over panels.

**Versioning / Drafts:** Changes saved as draft; "Publish Changes" updates public profile. Option: `oem_profile_versions` for audit.

**Key API Endpoints:**

- `GET /api/oem/profile` (admin detail)
- `PUT /api/oem/profile/basic`
- `PUT /api/oem/profile/media`
- `PUT /api/oem/profile/capabilities`
- `PUT /api/oem/profile/categories`
- `POST /api/oem/profile/publish` (republish after edits)

**Failure Cases / UX:**

- Missing critical field → disable Publish button with checklist
- Upload error for media → toast + retry link

---

### 2.2.4 Subscription & Tier Upgrade Flow

**Page:** `/dashboard/oem/subscription`

**Flow:**

1. OEM lands on subscription page (if Tier=Free show upgrade cards)
2. Chooses Tier → opens checkout modal (Stripe)
3. On success:
   - Tier set: INSIGHTS or VERIFIED_PARTNER
   - Record in `subscriptions`
4. If Tier = VERIFIED_PARTNER → show panel "Schedule Factory Inspection" (button)
5. Until inspection completes → status `VERIFIED_PENDING` (Badge: "Pending Verification")
6. After inspection report uploaded & approved → status `VERIFIED`

**Inspection Scheduling:**

- Page `/dashboard/oem/inspection`
- Calendar component → select date/time window
- API: `POST /api/oem/inspection/book`
- Status updates via admin panel

**Data Tables Recap:**

- `subscriptions` (oem_id, tier, status, stripe_subscription_id, current_period_end)
- `inspection_bookings` (oem_id, scheduled_date, status, inspector_id, report_url)

**Downgrade / Cancellation:**

- User can cancel → retains access until period_end then reverts to Free.

**Edge Cases:**

- Payment webhook fails → show banner "Payment processing, refresh later"
- Trying to access Insights without Tier ≥ Insights → redirect to subscription page with query `?locked=insights`

---

### 2.2.5 Verification & Media Enhancement Flow (Verified Partner)

Once inspection approved:

1. System sets `oem_profiles.verified_at`
2. Enable video upload sections: Factory Tour, QC Process
3. Badge "✅ Verified Partner" appears everywhere OEM card/profile renders
4. Ranking boost applied in matching algorithm (bonus points)

**Media Upload UI:** `/dashboard/oem/media`

- Upload video (mp4) or external link (YouTube/Vimeo)
- Generate thumbnail (frame capture first 3s)
- Validate max length (e.g., ≤ 5 min) & size
- API: `POST /api/oem/media/video`, `DELETE /api/oem/media/:id`

---

### 2.2.6 Insights & Analytics Access Flow

**Access Rules:**

- Free: No insights (redirect)
- Insights Tier: Basic modules
- Verified Partner: Full modules + drill-down & export

**Modules Unlock Mapping:**
| Module | Free | Insights | Verified Partner |
|--------|------|---------|------------------|
| Profile Views Trend | ✗ | ✓ (monthly) | ✓ (daily + filters) |
| Keyword Traffic | ✗ | ✓ (top10) | ✓ (top50 + segmentation) |
| Competitor Overview | ✗ | ✓ (max3 static) | ✓ (leaderboard + ranks) |
| Conversion Funnel | ✗ | ✗ | ✓ |
| Alerts / Spike Detection | ✗ | ✗ | ✓ |
| Export CSV | ✗ | ✓ | ✓ |
| Export PDF | ✗ | ✗ | ✓ |

**Data Flow:**

- Events logged via `oem_analytics_events`
- Daily cron aggregates → summary tables or materialized views
- Query layer returns tier-filtered payload

**API Examples:**

- `GET /api/oem/insights/overview`
- `GET /api/oem/insights/keywords?period=30d`
- `GET /api/oem/insights/competitors`
- `GET /api/oem/insights/funnel`
- `GET /api/oem/insights/export?format=pdf`

---

### 2.2.7 OEM Flow Summary Diagram

```
REGISTER → VERIFY(optional) → SETUP WIZARD (Products → Capabilities → Categories → MOQ → Certifications → Review)
   | (Completeness OK)
   v
PROFILE ACTIVE (Public listing) → SUBSCRIPTION (Upgrade) → INSPECTION (if Verified Partner) → VERIFIED → MEDIA (Videos) → INSIGHTS (Tier-based)
```

Detailed Transition:

```
UNREGISTERED
  ↓ register
REGISTERED
  ↓ start wizard
DRAFT (during steps)
  ↓ completeness met
ACTIVE
  ↓ upgrade to Verified Partner
VERIFIED_PENDING (inspection scheduled)
  ↓ inspection approved
VERIFIED
```

---

### 2.2.8 Error & Edge Case Handling

| Scenario                     | Behavior                                                      | Resolution                       |
| ---------------------------- | ------------------------------------------------------------- | -------------------------------- |
| Wizard step refresh          | Draft auto-loaded from `oem_profile_drafts`                   | Continue editing                 |
| Missing product images       | Block publish, checklist shows "Add at least 1 product image" | Add image then re-check          |
| Payment webhook delay        | Tier shows "Processing..." banner                             | Poll status / manual refresh     |
| Inspection date conflict     | API returns 409                                               | Show alternative available slots |
| Large video upload failure   | Partial chunk abort                                           | Retry with resumable upload      |
| Unauthorized insights access | 302 redirect → subscription page                              | Display upsell component         |

---

### 2.2.9 API & Data Validation Notes

- All create/update endpoints return canonical object + server timestamps
- Enforce max products during onboarding phase (e.g., ≤ 20 initial) to reduce abuse
- Rate limit media uploads (e.g., 10 per hour) until Verified status
- Certification PDFs virus scan (queued worker)
- Use background job to generate video thumbnails

---

### 2.2.10 Matching Algorithm Integration Points

- After profile becomes `ACTIVE`, enqueue recalculation of match vectors
- If Tier changes to Verified Partner → bump ranking factor & reindex
- Nightly job recalculates keyword traffic influence on match scoring

---

### 2.2.11 Security & Compliance Considerations

- Restrict direct file access: serve signed URLs (expiry 5m)
- Separate public vs admin media buckets (e.g., `oem-public`, `oem-private`)
- Log admin edits (audit trail table) for compliance reviews
- PII (contact emails/phones) only exposed to authenticated buyer accounts

---

### 2.2.12 Future Extensions (Backlog)

- Multi-user OEM admin roles (Owner, Staff)
- Internal messaging between buyer ↔ OEM inside dashboard
- Automated certification expiry reminders
- AI quality scoring of product descriptions
- Bulk product import (CSV) with validation preview

---

### 2.2.13 Implementation Order Recommendation

1. Registration & basic profile schema
2. Wizard (products, capabilities, categories, MOQ, certifications)
3. Publish logic + completeness guardrails
4. Company profile admin/public views
5. Subscription + payment integration
6. Inspection scheduling & status progression
7. Verified media uploads (videos)
8. Analytics event logging + basic Insights
9. Tier gating + export features
10. Reindex hooks for matching after status/tier changes

---

### 2.2.14 Success Metrics

- % OEM profiles reaching ACTIVE within 7 days
- Avg time from registration → first product added
- Conversion rate Free → Insights → Verified Partner
- Buyer match success rate increase post verification
- Latency of insights dashboard queries (< 500ms target for cached summary)

---

---

## Part 3: UX Design Guidelines

### 3.1 USER SIDE - High-Level UX Flow

#### 3.1.1 Home Page Layout (After Login)

**Page:** `/` or `/dashboard/buyer/page.tsx`

**Overall Layout:**

- Clean, modern, minimal design
- Divided into **2 equal halves** (50/50 split)

---

##### Top Half: Matching Panel (Hero Section)

**Visual Design:**

- **Background:** Gradient (e.g., blue to purple, or brand colors)
- **Center-aligned content:**
  - Large icon: 🔍 or 🤝 (search/handshake)
  - **Heading (H1):** "Find your OEM match"
  - **Subheading (smaller text):** "AI-powered matching to connect you with the perfect manufacturing partner"
  - **CTA Button (Large, prominent):** "Start Matching"
    - Style: Solid color, rounded corners, hover effect (scale/glow)
    - Click → Redirect to `/matching`

**Feature Icons (Below button, 3 columns):**

Horizontal row of 3 feature highlights:

1. **AI Matching**

   - Icon: 🤖
   - Text: "Smart algorithm finds your perfect OEM"

2. **Quick Filters**

   - Icon: ⚡
   - Text: "Filter by MOQ, lead time, certifications"

3. **Verified OEM Priority**
   - Icon: ✅
   - Text: "Inspected factories ranked higher"

**Design Inspiration:**

- Similar to modern search engines or SaaS landing pages
- Think: Google Search simplicity + Airbnb hero section

---

##### Bottom Half: Category Explorer

**Visual Design:**

- **Grid layout:**
  - Desktop: 4 columns
  - Tablet: 2 columns
  - Mobile: 1 column (vertical scroll)

**Category Cards:**

Each card:

- Large hero image (related to category)
  - Example: Skincare → spa/cosmetics image
  - Example: Food/Beverage → food production line
- Overlay gradient (dark to transparent from bottom to top)
- **Category name** (white text, bottom-center)
- Icon (emoji or SVG): 🧴 💊 💄 💇 🌸 🏠 🍽️ 📦
- **Hover effect:**
  - Image zooms slightly (scale 1.05)
  - Overlay darkens
  - "Browse OEMs" text appears
- **Click action:**
  - Redirect to `/oems?category=[category-name]`

**Design Inspiration:**

- Similar to Netflix category tiles or Pinterest grid
- Example image: Product discovery grids (like shown in the reference image you mentioned)

---

##### Header Navigation (Top of page)

**Left Side:**

- Logo (clickable → Home)
- Search bar (optional, for quick OEM search)

**Right Side:**

- **User avatar** (circular photo)
- **Username** (text next to avatar)
- **Dropdown menu** (on click):
  - ⚙️ Settings
  - 💾 Saved OEMs (with badge showing count, e.g., "5")
  - 💬 Support / Help
  - 🚪 Logout

**Design:**

- Sticky header (follows scroll)
- Clean, minimal, white background
- Subtle shadow on scroll

---

#### 3.1.2 Matching Page UX

**Page:** `/matching/page.tsx`

**Layout:**

- **Left sidebar (30%):** Visual illustration or OEM partner logos
- **Right main content (70%):** Form

---

##### Form Design:

**Container:**

- White card with shadow
- Rounded corners
- Padding: 2-3rem

**Heading:**

- **H2:** "Find Your Perfect OEM Partner"
- **Subheading:** "Tell us what you need, and we'll match you with verified manufacturers"

---

##### Form Fields (Vertical stack):

**1. Product Category** (Dropdown)

- Label: "What are you looking to produce?"
- Large dropdown with icons
- Options: 🧴 Skincare, 💊 Supplement, 💄 Makeup, etc.

**2. Target Price Range** (Dual number input)

- Label: "What's your target price range?"
- Two inputs side-by-side: "Min ฿" and "Max ฿"
- Optional: Currency selector (฿, $, ¥)

**3. Volume (pcs)** (Number input)

- Label: "How many units do you need?"
- Placeholder: "e.g., 1,000"
- Helper text: "Minimum order quantity"

**4. Required Certifications** (Checkbox group)

- Label: "What certifications do you need?"
- Checkboxes with icons:
  - ✅ GMP
  - ✅ ISO 9001
  - ✅ ISO 22716
  - ✅ Halal
  - ✅ Organic
  - ✅ FDA (Thailand)
  - ✅ Other (text input appears if checked)

**5. Preferred Lead Time** (Dropdown)

- Label: "When do you need it?"
- Options: "1-2 weeks", "2-4 weeks", "1-2 months", "2-3 months", "Flexible"

**6. Country Preference** (Dropdown - Optional)

- Label: "Preferred manufacturing country (optional)"
- Options: Thailand, Vietnam, China, Japan, etc., "No preference"

**7. Additional Requirements** (Textarea)

- Label: "Any additional requirements?"
- Placeholder: "e.g., Need eco-friendly packaging, R&D support, formula customization..."
- Helper text: "Our AI will analyze this to find better matches"

---

##### Submit Button:

**Button:**

- Large, full-width (or centered, 60% width)
- Text: **"Match Now"** or **"Find My OEM"**
- Primary color (e.g., blue, green)
- Hover effect: Slightly darker shade

**Action:**

- If **logged in:** Submit form → Redirect to `/results?matching=true`
- If **NOT logged in:** Show popup modal:
  - Title: "Login Required"
  - Message: "Please login to use our matching service"
  - Buttons: "Login" (primary), "Sign Up" (secondary), "Cancel"

---

#### 3.1.3 Matching Results Page UX

**Page:** `/results/page.tsx?matching=true`

**Layout:**

- **Top section:** Header + Sort/Filter controls
- **Main section:** OEM card list (grid or vertical list)

---

##### Top Section:

**Heading:**

- **H1:** "Your Best OEM Matches"
- **Subheading:** "Based on your requirements, we found **15** matching OEMs"

**Sort Options:**

- Dropdown (top-right):
  - 🏆 Best match (default)
  - ⚡ Fastest lead time
  - 💰 Lowest MOQ
  - ⭐ Highest rated (future phase)

---

##### OEM Card Design:

**Layout:** Horizontal card (row layout)

**Card Structure:**

```
┌────────────────────────────────────────────────────────────┐
│  ┌──────┐  Company Name                    95% Match       │
│  │ LOGO │  📍 Thailand • Skincare, Haircare                │
│  │      │  MOQ: 1,000 pcs | ⏱️ 2-4 weeks                    │
│  └──────┘  [GMP] [ISO] [Halal] certifications              │
│  Tier Badge                                                 │
│            [View Profile] [💾 Save]            [Video]      │
└────────────────────────────────────────────────────────────┘
```

**Left Section (20%):**

- **Logo** (square, 120x120px)
- **Tier Badge** (overlay on logo, bottom-left corner):
  - Free: Gray badge "Free"
  - Insights: Blue badge "📊 Insights"
  - Verified Partner: Gold/green badge "✅ Verified"

**Middle Section (60%):**

- **Company Name** (H3, clickable link → OEM profile)
- **Location:** 📍 Country
- **Categories:** Pills/tags (e.g., "Skincare", "Haircare")
- **Match Score:** Large badge (e.g., "95% Match" in green circle or pill)
- **MOQ:** "Minimum Order: 1,000 pcs"
- **Lead Time:** "⏱️ 2-4 weeks"
- **Certifications:** Icon badges (GMP, ISO, Halal, etc. - max 4, then "+2 more")

**Right Section (20%):**

- **Verified Partner Only:**
  - Video thumbnail (Factory Tour preview)
  - Play icon overlay (▶️)
  - Hover effect: Slight zoom + "Watch Factory Tour" text appears
  - Click → Opens video modal or inline player
- **Other Tiers:**
  - Static product image (no video)

**Bottom Section (Buttons):**

- **Primary Button:** "View Profile" (blue/primary color)
- **Secondary Button:** "💾 Save" (outline style)
  - If already saved: "❤️ Saved" (filled heart, red color, click to unsave)

**Card Spacing:**

- Margin-bottom: 1.5rem between cards
- Shadow on hover (elevation effect)

---

#### 3.1.4 Browse OEM List Page UX

**Page:** `/oems/page.tsx`

**Layout:**

- **Left Sidebar (25%):** Filters (logged-in users only)
- **Main Content (75%):** OEM card grid/list

---

##### For Guest Users (Not Logged In):

**Visual Indicators:**

- **Top Banner (Yellow/Info style):**
  - Icon: 🔒
  - Text: "Login to view full details and contact OEMs"
  - Button: "Login Now" (redirects to `/login`)

**OEM Cards:**

- Show: Logo, name, tier badge, location, category
- **Blurred/Hidden Fields:**
  - MOQ: "🔒 Login to view"
  - Price range: "🔒 Login to view"
  - Lead time: "🔒 Login to view"
- **Contact button:** Grayed out, disabled
  - Tooltip on hover: "Please login to contact OEMs"

**No Filters:**

- Left sidebar is hidden or shows message: "Login to access advanced filters"

---

##### For Logged-In Users:

**Left Sidebar - Filters:**

**Filter Groups (Collapsible sections):**

1. **Category** (Checkboxes)

   - 🧴 Skincare
   - 💊 Supplement
   - 💄 Makeup
   - 💇 Haircare
   - 🌸 Perfume
   - 🏠 Household
   - 🍽️ Food/Beverage
   - 📦 Others

2. **Tier** (Checkboxes)

   - Free
   - Insights
   - Verified Partner

3. **Certifications** (Checkboxes)

   - GMP
   - ISO 9001
   - ISO 22716
   - Halal
   - Organic
   - FDA (Thailand)

4. **Lead Time** (Range slider)

   - Min: 1 week, Max: 12 weeks
   - Visual slider with labels

5. **MOQ Range** (Number inputs)

   - Min: [input]
   - Max: [input]

6. **Country** (Dropdown multi-select)
   - Thailand
   - Vietnam
   - China
   - Japan
   - Korea
   - Malaysia
   - Indonesia
   - India
   - "All countries"

**Filter Actions:**

- **Apply Filters** button (bottom of sidebar)
- **Reset Filters** link (clear all)

---

**Main Content - OEM Cards:**

Same design as Matching Results page:

- Horizontal card layout
- Logo + Tier badge
- Company info + metrics
- Video thumbnail (Verified Partner)
- Buttons: "View Profile", "💾 Save", "Send RFQ"

**Sorting (Top-right of main content):**

- Dropdown: Relevance, Verified first, Lowest MOQ, Fastest lead time

**Pagination:**

- Bottom of page: Page numbers (1, 2, 3, ..., Next)
- Or: Infinite scroll (lazy load)

---

#### 3.1.5 OEM Profile Page UX (Public View)

**Page:** `/oem/[slug]/page.tsx`

**Layout:** Vertical scroll, full-width sections

---

##### Section 1: Hero Banner

**Design:**

- Full-width banner image (factory photo or branded banner)
- Height: 300-400px (desktop), 200px (mobile)
- **Company Logo** (overlaid on banner):
  - Position: Bottom-left corner
  - Size: 150x150px
  - Border: White border + shadow
- **Verified Badge** (top-right corner):
  - Badge: "✅ Verified Partner" (gold/green pill)
  - Tooltip on hover: "Factory inspected on [date]"
- **Edit Button** (top-right, OEM admin only):
  - Icon: ✏️ (pencil)
  - Text: "Edit Profile"

---

##### Section 2: Company Overview

**Container:** White card, padding 2rem

**Left Column (70%):**

- **Company Name** (H1)
- **Location:** 📍 Thailand, Bangkok
- **Established:** 🗓️ 2015
- **Website:** 🌐 [www.example.com](external link)

**Right Column (30%):**

- **Contact Info** (Logged-in users only):
  - 📧 Email: contact@example.com
  - 📞 Phone: +66 123 456 789
  - 💬 Line: @example_line
  - 💬 WeChat: example_wechat
- **CTA Button:** "Send RFQ" (large, primary color)
  - Guest users: Button disabled, tooltip "Login to contact"

---

##### Section 3: Videos (Verified Partner Only)

**Container:** Dark background (e.g., #1a1a1a or brand dark color)

**Layout:** 2 columns (50/50 split)

**Left Column:**

- **Title:** "🏭 Factory Tour"
- Embedded video player (YouTube/Vimeo or Supabase Storage)
- Duration label: "3:45"

**Right Column:**

- **Title:** "✅ Quality Control Process"
- Embedded video player
- Duration label: "2:30"

**If NOT Verified Partner:**

- This section is **hidden/not rendered**

---

##### Section 4: Capabilities Grid

**Container:** White card, padding 2rem

**Heading:** "🔧 Our Capabilities"

**Grid Layout:** 3 columns (desktop), 2 (tablet), 1 (mobile)

**Each capability card:**

- Icon (large, color)
- Title
- Short description

**Example Cards:**

1. ✅ **R&D Available**
   - "In-house research and development team"
2. 📦 **Packaging Service**
   - "Custom packaging design and production"
3. 🧪 **Formula Library**
   - "500+ proven formulations ready to use"
4. 🏷️ **White-label / OEM/ODM**
   - "Flexible branding options"
5. 🌍 **Export Experience**
   - "Shipping to 30+ countries"
6. 🗣️ **Languages**
   - "English, Thai, Chinese, Japanese"

---

##### Section 5: Certifications

**Container:** Light gray background, padding 2rem

**Heading:** "📜 Certifications & Compliance"

**Grid Layout:** Horizontal scroll or 4 columns

**Each certification card:**

- Large icon/badge (e.g., GMP logo)
- Certification name
- Expiry date (if applicable): "Valid until Dec 2025"
- **Download PDF button:**
  - Icon: 📄
  - Text: "Download Certificate"
  - Click → Downloads watermarked PDF

**Certifications:**

- GMP
- ISO 9001
- ISO 22716
- Halal
- Organic
- FDA (Thailand)
- Others

---

##### Section 6: Product Catalog

**Container:** White card, padding 2rem

**Heading:** "🛍️ Our Products"

**Filter Tabs (Top):**

- Tabs: All | Skincare | Haircare | Supplements | Makeup
- Active tab highlighted (underline or background color)

**Sort Dropdown (Top-right):**

- Newest
- Popular
- Low MOQ

**Product Grid:** 3-4 columns (desktop), 2 (tablet), 1 (mobile)

**Product Card:**

- Product photo (square, 250x250px)
- Product name (H4)
- Category tag (small pill)
- **MOQ:** "Min. 1,000 pcs" (logged-in users only)
- **Lead time:** "⏱️ 2-4 weeks" (logged-in users only)
- **Price range:** "฿50-100" (logged-in users only, if available)
- **Hover effect:** Image zooms slightly, "View Details" button appears
- **Click:** Opens modal/drawer with full product details

**Product Details Modal:**

- Carousel of 1-5 product photos
- Product name (H2)
- Full description
- Specifications (list)
- MOQ, lead time, price range
- **CTA Button:** "Request Quote" (closes modal, opens RFQ form)

---

##### Section 7: Contact CTA (Bottom)

**Container:** Gradient background (brand colors), padding 3rem

**Content (Center-aligned):**

- **Heading:** "Ready to work with us?"
- **Subheading:** "Send us a request for quotation"
- **Primary CTA Button:** "Send RFQ" (large, white button)
  - Click → Opens RFQ form modal or redirects to `/request?oem=[slug]`
- **Secondary Button:** "💾 Save OEM" (outline style)

**For Guest Users:**

- Buttons **disabled** (grayed out)
- Message above buttons: "🔒 Please login to contact this OEM"
- **Login Button** (replaces CTA buttons)

---

### 3.2 Design System & UI Components

#### 3.2.1 Color Palette

**Primary Colors:**

- Primary: #3B82F6 (Blue) - For CTAs, links, active states
- Secondary: #10B981 (Green) - For success, verified badges
- Accent: #F59E0B (Amber) - For warnings, highlights

**Neutral Colors:**

- Gray 50: #F9FAFB (Backgrounds)
- Gray 100: #F3F4F6 (Cards, dividers)
- Gray 600: #4B5563 (Body text)
- Gray 900: #111827 (Headings)

**Tier Badge Colors:**

- Free: #9CA3AF (Gray)
- Insights: #3B82F6 (Blue)
- Verified Partner: #10B981 (Green) or #F59E0B (Gold)

---

#### 3.2.2 Typography

**Fonts:**

- Headings: Inter, Poppins, or Noto Sans (Thai support)
- Body: Inter or Roboto
- Thai text: Noto Sans Thai or Sarabun

**Sizes:**

- H1: 2.5rem (40px)
- H2: 2rem (32px)
- H3: 1.5rem (24px)
- H4: 1.25rem (20px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)

---

#### 3.2.3 Button Styles

**Primary Button:**

- Background: Primary color (#3B82F6)
- Text: White
- Padding: 0.75rem 1.5rem
- Border-radius: 0.5rem (8px)
- Hover: Darker shade (#2563EB)

**Secondary Button:**

- Background: Transparent
- Border: 2px solid primary color
- Text: Primary color
- Padding: 0.75rem 1.5rem
- Hover: Background becomes primary color, text white

**Disabled Button:**

- Background: Gray (#D1D5DB)
- Text: Gray (#9CA3AF)
- Cursor: not-allowed

---

#### 3.2.4 Card Styles

**Standard Card:**

- Background: White
- Border: 1px solid #E5E7EB
- Border-radius: 0.75rem (12px)
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: Shadow increases (0 4px 6px rgba(0,0,0,0.1))

---

#### 3.2.5 Tier Badges

**Badge Styles:**

**Free Tier:**

- Background: #E5E7EB (Light gray)
- Text: #6B7280 (Dark gray)
- Border: None
- Text: "Free"

**Insights Tier:**

- Background: #DBEAFE (Light blue)
- Text: #1E40AF (Dark blue)
- Icon: 📊
- Text: "Insights"

**Verified Partner:**

- Background: Linear gradient (#10B981 to #059669) OR Gold (#F59E0B)
- Text: White
- Icon: ✅
- Text: "Verified Partner"
- Optional: Glow/shadow effect

---

#### 3.2.6 Spacing & Layout

**Container Max-Width:**

- Desktop: 1280px (xl)
- Centered with auto margins

**Section Padding:**

- Vertical: 4rem (64px)
- Horizontal: 2rem (32px)

**Grid Gaps:**

- Cards: 1.5rem (24px)
- Filters: 1rem (16px)

---

#### 3.2.7 Responsive Breakpoints

**Breakpoints:**

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Layout Adjustments:**

- Mobile: Single column, stack vertically
- Tablet: 2 columns for grids
- Desktop: 3-4 columns for grids

---

### 3.3 Interaction Patterns

#### 3.3.1 Guest User Experience

**Guest users should:**

- See limited information (teasers)
- Encounter **disabled buttons** with tooltips explaining "Login required"
- See **banner messages** at top of restricted pages: "🔒 Login to access full features"
- Be able to **browse** and **explore** but not **contact** or **match**

**Visual Cues for Guests:**

- Blurred text for sensitive info (MOQ, price, contact)
- Lock icon (🔒) next to hidden fields
- Yellow/amber banner at top of pages

---

#### 3.3.2 Logged-In User Experience

**Logged-in users should:**

- See **full information** (MOQ, price, contact details)
- Have access to **all buttons** (Contact, Save, Send RFQ, Match)
- See **personalized content** (saved OEMs, match history)
- Receive **notifications** (new matches, saved OEM updates)

---

#### 3.3.3 Hover & Click Effects

**Cards:**

- Hover: Slight shadow increase (elevation)
- Click: Redirect to detail page

**Buttons:**

- Hover: Slightly darker background, scale 1.02
- Click: Scale 0.98 (press effect)

**Video Thumbnails:**

- Hover: Play icon appears, zoom effect on thumbnail
- Click: Opens video modal or inline player

---

#### 3.3.4 Loading States

**Skeleton Loaders:**

- Use for OEM cards while data loads
- Gray animated shimmer effect

**Loading Buttons:**

- Show spinner icon inside button
- Disable button during loading
- Text: "Loading..." or "Processing..."

---

#### 3.3.5 Empty States

**No Results:**

- Icon: 🔍 or 😔
- Heading: "No OEMs found"
- Message: "Try adjusting your filters or search criteria"
- CTA: "Clear Filters" or "Browse All OEMs"

**No Saved OEMs:**

- Icon: 💾
- Heading: "You haven't saved any OEMs yet"
- Message: "Start exploring and save OEMs for future reference"
- CTA: "Browse OEMs"

---

### 3.4 Accessibility (A11y) Guidelines

**Must-haves:**

- ✅ Alt text for all images
- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ Focus indicators (visible outline on focused elements)
- ✅ ARIA labels for icons/buttons
- ✅ Color contrast ratio ≥ 4.5:1 (WCAG AA)
- ✅ Screen reader support

---

### 3.5 Performance Optimization

**Image Optimization:**

- Use Next.js `<Image>` component
- Lazy load images below fold
- WebP format with fallback

**Code Splitting:**

- Lazy load modals, drawers
- Dynamic imports for heavy components

**Caching:**

- Cache OEM list data (SWR or React Query)
- Cache static assets (logos, images)

---

## Implementation Summary

This plan covers:

✅ **Part 1:** Detailed page specifications with database schema
✅ **Part 2.1:** Complete Brand/Buyer user flow with screen-by-screen descriptions
✅ **Part 3:** Comprehensive UX design guidelines with layout, visual design, and interaction patterns

**Next Steps:**

1. Set up database schema (create tables for capabilities, certifications, subscriptions, analytics)
2. Implement Part 2.1 pages (Home, Matching, Results, Browse, Profile)
3. Build UI components (cards, badges, filters)
4. Integrate matching algorithm with AI search
5. Implement access control (guest vs logged-in)
6. Add analytics tracking for Insights tier
7. Build OEM flow (Part 2.2 - future implementation)

---

_End of PLAN.md - Part 2.1 Implementation_
