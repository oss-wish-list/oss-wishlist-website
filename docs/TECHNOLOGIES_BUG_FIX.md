# Technologies Field - Bug Fixes

## Problem
When creating a new wishlist with technologies:
1. GitHub issue was created correctly with technologies
2. JSON cache file missing technologies field
3. Could not edit wishlist (page wouldn't load)
4. Technologies not showing in browse wishlists page

## Root Causes

### 1. Cache API Missing Technologies Field
**File:** `src/pages/api/cache-wishlist.ts`

**Problem:** The `WishlistData` interface didn't include `technologies` field, so when caching the wishlist, technologies were being dropped.

**Fix:**
```typescript
interface WishlistData {
  // ... other fields
  technologies?: string[];  // ✅ ADDED
  // ...
}

// Also added to wishlist data creation:
const wishlistData: WishlistData = {
  // ...
  technologies: parsed.technologies,  // ✅ ADDED
  // ...
};
```

### 2. Parser Not Finding Technologies
**File:** `src/lib/issue-form-parser.ts`

**Problem:** Technologies are written in markdown format under "## Project Information" section:
```markdown
## Project Information
- **Technologies:** JavaScript, React, Node.js
```

But the parser was only looking for "### Technologies" headers in the switch statement.

**Fix:** Moved technology parsing to the beginning of the function to search the entire body:
```typescript
export function parseIssueForm(body: string): ParsedIssueForm {
  // ...
  
  // Parse technologies from anywhere in the body (✅ ADDED)
  const techMatch = body.match(/[-*]\s*\*\*Technologies:\*\*\s*(.+?)(?:\n|$)/);
  if (techMatch) {
    result.technologies = techMatch[1].split(',').map(t => t.trim()).filter(t => t);
  }
  
  // Then parse sections...
}
```

The regex now:
- Finds `- **Technologies:**` or `* **Technologies:**`
- Captures everything after it until newline
- Splits by comma and trims whitespace

## Files Changed

1. ✅ `src/pages/api/cache-wishlist.ts`
   - Added `technologies?: string[]` to `WishlistData` interface
   - Added `technologies: parsed.technologies` when creating cache data

2. ✅ `src/lib/issue-form-parser.ts`
   - Added `technologies?: string[]` to `ParsedIssueForm` interface  
   - Moved technology parsing to search entire body with regex
   - Removed duplicate case statement for Technologies

## Testing

To verify the fix works:

1. **For New Wishlists:**
   - Create wishlist with technologies selected
   - Check GitHub issue has `- **Technologies:** ...` in Project Information
   - Verify JSON cache file includes `"technologies": ["...", "..."]`
   - Confirm wishlist appears in browse page with tech count updated

2. **For Existing Wishlists:**
   - Refresh cache: `GET /api/cache-wishlist?issueNumber=19`
   - Or wait for automatic cache refresh (10 minutes)
   - Technologies should be parsed from existing GitHub issues

3. **Edit Page:**
   - Navigate to edit page for wishlist with technologies
   - Technologies should be pre-populated in form
   - Page should load without errors

## Cache Refresh

If you have existing wishlists that need technologies added:

**Manual Refresh:**
```bash
curl "http://localhost:4324/oss-wishlist-website/api/cache-wishlist?issueNumber=19"
```

**Automatic Refresh:**
- Cache auto-refreshes every 10 minutes
- Or create/edit any wishlist to trigger full cache update

## Status

✅ All fixes applied
🔄 Needs testing with server restart
📝 Existing wishlist #19 needs cache refresh to pick up technologies
