# Browse Sponsors Feature & Ecosystem Guardians Style Update

## Summary
Added "Browse Sponsors" link to maintainers menu, created dedicated browse-sponsors page, and updated ecosystem-guardians page to match site style standards.

## Changes Made

### 1. Header Navigation Menu
**File:** `/src/components/Header.astro`

Added "Browse Sponsors" link to the "For Maintainers" dropdown menu:

```html
<div class="py-1" role="none">
  <a href="${basePath}maintainers">Manage Wishlists</a>
  <a href="${basePath}practitioners">Browse Practitioners</a>
  <a href="${basePath}browse-sponsors">Browse Sponsors</a> <!-- NEW -->
</div>
```

**Navigation Structure:**
- For Maintainers
  - Manage Wishlists
  - Browse Practitioners
  - Browse Sponsors ✨ NEW

### 2. New Browse Sponsors Page
**File:** `/src/pages/browse-sponsors.astro` (NEW)

Created a clean, focused page for browsing all sponsors with:

**Hero Section:**
- Title: "Browse Sponsors"
- Gray accent color (`text-gray-600`)
- Centered layout with proper spacing
- Clear description of purpose

**All Sponsors Grid:**
- 3-column grid (responsive)
- Sponsor cards with:
  - Logo display
  - Name and type
  - Description (truncated to 2 lines)
  - Focus areas (first 2 as tags)
  - Verified badge with checkmark icon (not emoji)
  - "View" link with arrow icon

**CTA Section:**
- "Interested in Becoming a Sponsor?" heading
- Two action buttons:
  - "Browse Wishlists to Fund" (primary)
  - "Become a Sponsor" (secondary)

### 3. Ecosystem Guardians Page Updates
**File:** `/src/pages/ecosystem-guardians.astro`

**Hero Section:**
- Changed from gradient background (`bg-gradient-to-br from-gray-100 to-gray-200`) to standard (`py-16 bg-gray-50`)
- Reduced padding from `py-20` to `py-16`
- Title now uses gray accent: `text-gray-600` (was `text-gray-700`)
- Matches standard hero pattern

**"How It Works" and "Perfect For" Cards:**
- Changed from colored backgrounds (`bg-gray-100`, `bg-gray-200`) to white cards with border
- Updated to use `shadow-sm border` (consistent with site)
- Changed text colors:
  - Headings: `text-gray-800` → `text-gray-900`
  - Body text: `text-gray-700` → `text-gray-600`
- Added `flex-shrink-0` to numbered badges for better alignment

**CTA Card:**
- Added `shadow-sm border` for consistency
- Changed link from inline to `inline-block` for proper button styling

**All Sponsors Section:**
- **Removed emoji:** "🌟 All Sponsors" → "All Sponsors"
- **Added hover effect:** Cards now have `hover:shadow-md transition-shadow`
- **Updated verified badge:** 
  - Changed from emoji "✓ Verified" to proper SVG checkmark icon
  - Wrapped in flex container for proper alignment
- **Updated "View" link:**
  - Changed from "View →" text to "View" with proper arrow SVG icon
  - Added flex container for icon alignment
  - Fixed path to use `${basePath}` variable (was hardcoded)

## Style Standards Applied

✅ **Hero Pattern**
```html
<section class="py-16 bg-gray-50">
  <h1 class="text-5xl font-bold text-gray-900 mb-6">
    Title <span class="text-gray-600">Accent</span>
  </h1>
</section>
```

✅ **Card Pattern**
```html
<div class="bg-white rounded-lg shadow-sm border p-8">
  <!-- Content -->
</div>
```

✅ **Icons Over Emojis**
- Checkmark icon for verified status
- Arrow icon for navigation
- Standard SVG icons for consistency

✅ **Color Consistency**
- Primary: `text-gray-900`
- Secondary: `text-gray-600`
- Accent: `text-gray-600`
- Background: `bg-gray-50`
- Cards: `bg-white` with `shadow-sm border`

## Benefits

### For Maintainers
- Easy access to sponsor directory directly from their menu
- Can quickly find potential sponsors for their projects
- Clear path to explore funding opportunities

### For Sponsors
- Dedicated browse page highlights all sponsors equally
- Clean, professional presentation
- Clear CTAs for engagement

### Design System
- Consistent styling across all pages
- Professional appearance (no emojis)
- Standard iconography
- Predictable hover states
- Unified color scheme

## User Flows

### Maintainer Flow
1. Click "For Maintainers" menu
2. Select "Browse Sponsors"
3. View all sponsors in clean grid
4. Click sponsor card to learn more
5. Optionally: Click CTA to become a sponsor

### Sponsor Flow
1. Navigate to "Sponsor Directory" or "Browse Sponsors"
2. View sponsors and their focus areas
3. See verified status with clear icon
4. Click to view full sponsor details

## Files Modified

1. `/src/components/Header.astro` - Added menu link
2. `/src/pages/browse-sponsors.astro` - New page (created)
3. `/src/pages/ecosystem-guardians.astro` - Style updates

## Technical Notes

- Both pages use same data source: `getCollection('guardians')`
- Sponsors sorted alphabetically
- Responsive grid: 1 column (mobile) → 2 (tablet) → 3 (desktop)
- Hover states for better UX
- Proper semantic HTML and ARIA attributes
- Consistent use of `basePath` for navigation
