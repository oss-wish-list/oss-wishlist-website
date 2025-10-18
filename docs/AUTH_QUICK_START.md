# Centralized Authentication System - Quick Start

## What Was Created

### 1. Core Auth Library (`src/lib/auth.ts`)
**Purpose**: Provider-agnostic authentication utilities for both server and client

**Server-side Functions**:
- `getSession(cookies)` - Get current session
- `requireAuth(cookies, redirect)` - Require auth, redirect if not authenticated
- `isAuthenticated(cookies)` - Boolean check

**Client-side Functions**:
- `fetchSession()` - Get session from server
- `getCachedSession()` - Get from sessionStorage cache
- `setCachedSession()` - Store in sessionStorage

### 2. React Context (`src/lib/auth-context.tsx`)
**Purpose**: Unified auth state for React components

**Main Exports**:
- `UnifiedAuthProvider` - Wrap your app
- `useUnifiedAuth()` - Hook to access auth
- `RequireAuth` - Component to protect content

### 3. AuthGuard Component (`src/components/AuthGuard.astro`)
**Purpose**: Server-side page protection (runs during SSR)

**Usage**:
```astro
<AuthGuard redirectTo="/">
  <ProtectedContent />
</AuthGuard>
```

### 4. Middleware (`src/middleware.ts`)
**Purpose**: Protect routes automatically

**Configure**:
```typescript
const PROTECTED_ROUTES = [
  '/maintainers',
  '/admin',
  // Add more...
];
```

### 5. Documentation (`docs/AUTHENTICATION.md`)
Comprehensive guide with examples and best practices

## Quick Examples

### Protect an Astro Page (Server-Side)
```astro
---
import AuthGuard from '../components/AuthGuard.astro';
import { getSession } from '../lib/auth';

const session = getSession(Astro.cookies);
---

<AuthGuard>
  <h1>Welcome, {session.user.name}!</h1>
</AuthGuard>
```

### Protect React Component (Client-Side)
```tsx
import { RequireAuth, useUnifiedAuth } from '../lib/auth-context';

function MyComponent() {
  const { user, logout } = useUnifiedAuth();
  
  return (
    <RequireAuth>
      <div>
        <p>Hello, {user.username}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    </RequireAuth>
  );
}
```

### Use in API Route
```typescript
import { getSession } from '../../lib/auth';

export const GET: APIRoute = async ({ cookies }) => {
  const session = getSession(cookies);
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401
    });
  }
  
  // User is authenticated
  return new Response(JSON.stringify({ user: session.user }));
};
```

## Migration Checklist

- [ ] Wrap app with `UnifiedAuthProvider`
- [ ] Replace `AuthProvider` → `UnifiedAuthProvider`
- [ ] Replace `AuthenticatedForm` → `RequireAuth`
- [ ] Update `AuthButton` to use `useUnifiedAuth()`
- [ ] Add protected routes to `middleware.ts`
- [ ] Use `AuthGuard` for server-protected pages
- [ ] Access `Astro.locals.user` instead of checking cookies manually

## Benefits

✅ **Centralized** - Single source of truth  
✅ **Type-safe** - Full TypeScript support  
✅ **Performance** - Client-side caching with server verification  
✅ **Secure** - httpOnly cookies, signed sessions  
✅ **Flexible** - Works server-side and client-side  
✅ **Extensible** - Ready for multiple OAuth providers  
✅ **Standards-compliant** - Follows Astro best practices

## Key Changes Made

1. ✅ Created `src/lib/auth.ts` - Core utilities
2. ✅ Created `src/lib/auth-context.tsx` - React Context
3. ✅ Created `src/components/AuthGuard.astro` - SSR protection
4. ✅ Created `src/middleware.ts` - Route protection
5. ✅ Updated `src/env.d.ts` - Added Locals types
6. ✅ Updated `AuthButton.tsx` - Uses new context
7. ✅ Updated `AuthenticatedForm.tsx` - Uses RequireAuth
8. ✅ Updated `AuthButtonAstro.astro` - Wraps with provider
9. ✅ Updated `maintainers.astro` - Uses new system
10. ✅ Created comprehensive documentation

## Next Steps

1. Test authentication flow end-to-end
2. Update other pages to use `AuthGuard` if needed
3. Add more routes to `PROTECTED_ROUTES` as needed
4. Consider adding other OAuth providers (GitLab, Google, etc.)

## Files to Review

- **Core**: `src/lib/auth.ts`, `src/lib/auth-context.tsx`
- **Components**: `src/components/AuthGuard.astro`, `src/components/AuthButton.tsx`
- **Middleware**: `src/middleware.ts`
- **Docs**: `docs/AUTHENTICATION.md`
