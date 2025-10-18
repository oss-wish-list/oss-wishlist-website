# Authentication Architecture - Final Clean State

## Overview

The application now uses a **centralized authentication system** built on Astro best practices. This document describes the clean, final architecture.

## Core Principles

1. **Single Source of Truth**: All auth logic lives in `src/lib/auth.ts`
2. **Provider-Agnostic**: Easy to add new OAuth providers (GitHub, GitLab, Google, etc.)
3. **Astro-Native**: Uses middleware, locals, and SSR appropriately
4. **Minimal Dependencies**: No external auth libraries, just standard OAuth flows

## File Structure

```
src/
├── lib/
│   ├── auth.ts              # Core auth utilities (server + client)
│   └── auth-context.tsx     # React Context for form components
├── middleware.ts            # Route protection via Astro middleware
├── components/
│   ├── AuthButton.tsx       # Header login button (no provider needed)
│   ├── AuthButtonAstro.astro # Astro wrapper for AuthButton
│   ├── AuthenticatedForm.tsx # Form wrapper requiring auth
│   └── AuthGuard.astro      # SSR auth guard component
└── pages/
    ├── maintainers.astro    # Example: Protected form page
    └── api/
        └── auth/            # OAuth endpoints
```

## Component Usage Patterns

### 1. Header Login Button (Simple)

**File**: `src/components/AuthButton.tsx`

```tsx
// Uses centralized auth utilities directly
// No provider context needed
import { fetchSession, getLoginUrl, getLogoutUrl } from '../lib/auth';
```

**Usage**: Already in `Header.astro` via `AuthButtonAstro.astro`

### 2. Protected Forms (Context-Based)

**File**: `src/pages/maintainers.astro`

```astro
<UnifiedAuthProvider client:load>
  <AuthenticatedForm client:load>
    <WishlistForm client:load services={servicesData} />
  </AuthenticatedForm>
</UnifiedAuthProvider>
```

**Why?** Forms need reactive auth state for complex interactions.

### 3. Protected Pages (SSR)

**Option A**: Use AuthGuard component

```astro
<AuthGuard redirectTo="/">
  <ProtectedContent />
</AuthGuard>
```

**Option B**: Add to middleware's `PROTECTED_ROUTES` array

```ts
const PROTECTED_ROUTES = [
  '/maintainers',
  '/api/wishlists/create',
  '/dashboard',  // Add new protected routes here
];
```

## Current Auth Usage

### ✅ Using NEW Centralized System

| File | Component | Method |
|------|-----------|--------|
| `src/components/AuthButton.tsx` | Header login button | Direct `fetchSession()` calls |
| `src/components/AuthenticatedForm.tsx` | Form wrapper | `RequireAuth` component |
| `src/pages/maintainers.astro` | Wishlist form page | `UnifiedAuthProvider` context |
| `src/middleware.ts` | Route protection | `getSession()` from auth.ts |

### ⚠️ Old Files (Can Be Removed Later)

| File | Status | Action |
|------|--------|--------|
| `src/components/AuthProvider.tsx` | No longer used | Can delete after testing |

## Session Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User clicks "Login"
       ↓
┌─────────────────────┐
│ /api/auth/github    │ ← Initiates OAuth flow
└──────┬──────────────┘
       │
       │ 2. Redirects to GitHub
       ↓
┌─────────────────────┐
│   GitHub OAuth      │ ← User authorizes
└──────┬──────────────┘
       │
       │ 3. Callback with code
       ↓
┌─────────────────────┐
│ /api/auth/callback  │ ← Exchange code for token
└──────┬──────────────┘
       │
       │ 4. Create signed session
       ↓
┌─────────────────────┐
│   Set httpOnly      │ ← Secure cookie
│   Cookie            │
└──────┬──────────────┘
       │
       │ 5. Cache in sessionStorage
       ↓
┌─────────────────────┐
│   Redirect to app   │
└─────────────────────┘
```

## Adding New OAuth Providers

See `docs/AUTHENTICATION.md` section "Adding a New OAuth Provider"

Quick summary:
1. Add provider config to `src/config/github.ts` (or create new config file)
2. Add provider case to `getLoginUrl()` in `src/lib/auth.ts`
3. Create `/api/auth/{provider}` endpoint
4. Test OAuth flow

## Security Features

- ✅ httpOnly cookies (can't be accessed by JavaScript)
- ✅ Signed sessions (prevents tampering)
- ✅ CSRF protection (state parameter in OAuth flow)
- ✅ 24-hour session expiry
- ✅ Server-side session verification
- ✅ No sensitive data in client storage

## Testing Checklist

- [ ] Header login button works on all pages
- [ ] Wishlist form shows login prompt when not authenticated
- [ ] Wishlist form renders when authenticated
- [ ] Logout clears session and redirects
- [ ] Middleware protects `/maintainers` route
- [ ] Session persists across page refreshes (24 hours)
- [ ] Session expires after 24 hours

## Migration Summary

**Before**: Auth logic scattered across multiple files with duplicate session checks

**After**: 
- One auth library (`src/lib/auth.ts`) 
- One React context for complex forms (`src/lib/auth-context.tsx`)
- Simple components call utilities directly
- Middleware handles route protection
- Type-safe session access via `Astro.locals`

## Questions?

See `docs/AUTHENTICATION.md` for detailed API reference and examples.
