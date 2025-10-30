---
title: "Why isn't my approved wishlist showing up?"
description: "Understanding wishlist approval and cache delays"
category: "For Maintainers"
order: 10
---

After your wishlist is approved (when we add the `approved-wishlist` label to your GitHub issue), it may take up to **10 minutes** to appear on the wishlists page due to caching.

## Quick Fix

To see your approved wishlist immediately, add `?refresh=true` to the URL:

```
https://your-site.com/oss-wishlist-website/wishlists?refresh=true
```

Or just refresh the page a few times—once the cache expires (10 minutes), your wishlist will appear.

## Why the delay?

We cache wishlist data to:
- Reduce load on GitHub's API
- Make the wishlists page load faster for everyone
- Avoid hitting rate limits

The cache automatically refreshes every 10 minutes.

## Still not seeing it?

Make sure your wishlist issue has the `approved-wishlist` label. You can check this on the GitHub issue itself—look for the green label on the right side of the issue page.

If the label is there but your wishlist still doesn't appear after 10+ minutes, please [open an issue](https://github.com/oss-wishlist/wishlists/issues) in our repository.
