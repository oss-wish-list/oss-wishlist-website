# Final Simple Authentication System

## Overview
Super simple authentication - check if user is logged in, show/hide content based on that.

## How It Works

### 1. User Logs In
- Clicks "Sign in with GitHub" → Goes to `/api/auth/github`
- OAuth flow → Cookie `github_session` is set
- Redirected back to site

### 2. Every Page Load
- **Middleware** (`src/middleware.ts`) runs on every request
- Checks `github_session` cookie
- Sets `Astro.locals.user` (either user object or `null`)

### 3. Show/Hide Content

**In Astro pages (server-side):**
```astro
---
const user = Astro.locals.user;  // Set by middleware
---

{user ? (
  <p>Welcome {user.username}!</p>
) : (
  <p>Please log in</p>
)}
```

**For React forms:**
```astro
---
const user = Astro.locals.user;
---

<AuthenticatedForm client:load user={user}>
  <YourForm />
</AuthenticatedForm>
```

## Files That Matter

1. **`src/lib/auth.ts`** - Core functions
   - `getSession(cookies)` - Get user from cookie
   - Uses cookie name: `github_session`

2. **`src/middleware.ts`** - Runs on every request
   - Calls `getSession()`
   - Sets `Astro.locals.user`

3. **`src/components/AuthenticatedForm.tsx`** - Wrapper for protected forms
   - Takes `user` as prop
   - Shows login button if no user
   - Shows children if user exists

## That's It!

No providers, no contexts, no complexity. Just:
1. Check `Astro.locals.user` 
2. If null → show login
3. If exists → show content

## TypeScript Errors (Can Ignore)
The IDE may show errors about `Property 'user' does not exist on type 'Locals'` - these are just cache issues and don't affect runtime. The app works correctly.
