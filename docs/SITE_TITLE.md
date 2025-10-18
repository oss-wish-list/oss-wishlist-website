# Site Title Configuration

## Centralized Configuration
The site title is now centralized in `src/config/app.ts`:

```typescript
export const SITE_TITLE = 'Open Source Wishlist';
export const SITE_DESCRIPTION = 'Connecting open source projects with expert help and resources';
```

## Usage
Import and use in any Astro page or component:

```astro
---
import { SITE_TITLE } from '../config/app';
---

<Layout title={`Page Name - ${SITE_TITLE}`}>
  <h1>Welcome to {SITE_TITLE}</h1>
</Layout>
```

## Files That Should Use SITE_TITLE

### High Priority (User-Facing Pages)
- ✅ `src/pages/login.astro` - FIXED
- `src/pages/index.astro`
- `src/pages/about.astro`
- `src/pages/maintainers.astro`
- `src/pages/apply-practitioner.astro`
- `src/pages/faq.astro`
- `src/pages/how-it-works.astro`
- `src/pages/companies.astro`

### Medium Priority (Content)
- `src/content/pages/how-it-works.md`
- `src/components/WishlistForms.tsx`

### Low Priority (Internal/Docs)
- `README.md` - Can stay as "OSS Wishlist" (shorthand in docs is fine)
- `.env.example` - Email from name (could use SITE_TITLE)
- `copilot_notes/*.md` - Internal docs
- `docs/*.md` - Internal docs

## Search and Replace
To find remaining instances:
```bash
grep -r "OSS Wishlist" src/pages/ src/components/
```

## Notes
- "OSS Wishlist" was used as shorthand in many places
- The official name is "Open Source Wishlist"
- Keep consistency in user-facing content
- Documentation can use shorthand "OSS Wishlist" for brevity
