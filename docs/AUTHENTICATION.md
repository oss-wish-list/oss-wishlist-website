# Authentication System Documentation

## Overview

The OSS Wishlist platform uses a **centralized, provider-agnostic authentication system** that works seamlessly across:
- **Server-side** (Astro pages and API routes)
- **Client-side** (React components)
- **Future OAuth providers** (currently GitHub, ready for GitLab, Google, etc.)

## Architecture

### Core Files

1. **`src/lib/auth.ts`** - Core authentication utilities
   - Server-side: `getSession()`, `requireAuth()`, `isAuthenticated()`
   - Client-side: `fetchSession()`, `getCachedSession()`, `setCachedSession()`
   - Provider URLs: `getLoginUrl()`, `getLogoutUrl()`

2. **`src/lib/auth-context.tsx`** - React Context for client components
   - `UnifiedAuthProvider` - Wraps your app
   - `useUnifiedAuth()` - Hook to access auth state
   - `RequireAuth` - Component to protect React content

3. **`src/components/AuthGuard.astro`** - Server-side guard for Astro pages
   - Runs during SSR
   - Redirects unauthenticated users
   - Zero client-side flash

4. **`src/middleware.ts`** - Global route protection
   - Protects routes by path
   - Adds session to `Astro.locals`
   - Runs on every request

5. **`src/lib/github-oauth.ts`** - Provider-specific implementation
   - GitHub OAuth flow
   - Session creation/verification
   - User data fetching

## Usage Guide

### Protecting an Entire Astro Page (Recommended)

Use `AuthGuard` to protect entire pages server-side:

```astro
---
// src/pages/admin.astro
import Layout from '../components/Layout.astro';
import AuthGuard from '../components/AuthGuard.astro';
import { getSession } from '../lib/auth';

// Get session data for use in page
const session = getSession(Astro.cookies);
---

<AuthGuard redirectTo="/">
  <Layout title="Admin Dashboard">
    <h1>Welcome, {session.user.name}!</h1>
    <p>Email: {session.user.email}</p>
  </Layout>
</AuthGuard>
```

**Benefits:**
- Runs during SSR (server-side rendering)
- No flash of unauth content
- SEO-friendly
- Fastest approach

### Protecting React Components

Use `RequireAuth` component or the hook:

```tsx
import { RequireAuth, useUnifiedAuth } from '../lib/auth-context';

function ProtectedComponent() {
  const { user, logout } = useUnifiedAuth();
  
  return (
    <RequireAuth>
      <div>
        <h1>Hello, {user.username}!</h1>
        <button onClick={logout}>Logout</button>
      </div>
    </RequireAuth>
  );
}
```

### Wrapping Your App with Auth Context

In your root layout or `_app` equivalent:

```tsx
import { UnifiedAuthProvider } from './lib/auth-context';

function App({ children }) {
  return (
    <UnifiedAuthProvider>
      {children}
    </UnifiedAuthProvider>
  );
}
```

### Using Auth in API Routes

```typescript
// src/pages/api/protected-endpoint.ts
import type { APIRoute } from 'astro';
import { getSession } from '../../lib/auth';

export const GET: APIRoute = async ({ cookies }) => {
  const session = getSession(cookies);
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // User is authenticated
  const user = session.user;
  
  return new Response(JSON.stringify({ 
    message: `Hello, ${user.username}!` 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Protecting Routes with Middleware

Edit `src/middleware.ts` to add protected routes:

```typescript
const PROTECTED_ROUTES = [
  '/maintainers',
  '/admin',
  '/dashboard',
  '/api/wishlists/create',
];
```

Any route in this array will automatically require authentication.

### Conditionally Rendering Content

**In Astro:**

```astro
---
import { isAuthenticated } from '../lib/auth';

const isLoggedIn = isAuthenticated(Astro.cookies);
---

{isLoggedIn ? (
  <p>Welcome back!</p>
) : (
  <p>Please log in</p>
)}
```

**In React:**

```tsx
import { useUnifiedAuth } from '../lib/auth-context';

function MyComponent() {
  const { user, loading } = useUnifiedAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return user ? (
    <div>Welcome, {user.username}!</div>
  ) : (
    <div>Please log in</div>
  );
}
```

### Accessing User Data in Astro Pages

Session data is available in `Astro.locals` (added by middleware):

```astro
---
// src/pages/profile.astro
const user = Astro.locals.user;
const session = Astro.locals.session;
---

{user && (
  <div>
    <img src={user.avatar_url} alt={user.username} />
    <h1>{user.name}</h1>
    <p>{user.email}</p>
  </div>
)}
```

## Session Management

### How Sessions Work

1. **User logs in** via OAuth (GitHub)
2. **Server creates signed session token** (JWT-like, stored in httpOnly cookie)
3. **Token contains**:
   - User ID, username, name, email, avatar
   - OAuth access token (for API calls)
   - Provider info
4. **Client caches session** in sessionStorage (24hr TTL)
5. **Session verified** on every request via middleware

### Session Lifecycle

- **Duration**: 24 hours
- **Storage**: httpOnly cookie (server) + sessionStorage (client)
- **Renewal**: Re-login required after expiry
- **Invalidation**: Logout endpoint clears cookie and cache

### Security Features

- ✅ **Signed sessions** - Can't be tampered with
- ✅ **httpOnly cookies** - Can't be accessed by JavaScript
- ✅ **Timing-safe comparisons** - Prevents timing attacks
- ✅ **State parameter** - Prevents CSRF in OAuth flow
- ✅ **Secure flag in production** - HTTPS only
- ✅ **SameSite=lax** - Additional CSRF protection

## Adding a New OAuth Provider

### 1. Add Provider Configuration

In `src/lib/auth.ts`:

```typescript
export interface User {
  // ... existing fields
  provider: 'github' | 'gitlab' | 'google'; // Add new provider
}

export function getLoginUrl(provider: 'github' | 'gitlab' = 'github'): string {
  switch (provider) {
    case 'github':
      return '/api/auth/github';
    case 'gitlab':  // New provider
      return '/api/auth/gitlab';
    default:
      throw new Error(`Unknown auth provider: ${provider}`);
  }
}
```

### 2. Create Provider OAuth Implementation

Create `src/lib/gitlab-oauth.ts` (or similar):

```typescript
// Implement OAuth flow for new provider
export function getGitLabAuthUrl(...) { ... }
export async function exchangeCodeForToken(...) { ... }
export async function fetchGitLabUser(...) { ... }
```

### 3. Create API Routes

```
src/pages/api/auth/
  gitlab.ts       # Initiate OAuth
  gitlab-callback.ts  # Handle callback
```

### 4. Update Session Conversion

In `src/lib/auth.ts`:

```typescript
function sessionDataToUser(sessionData: SessionData): User {
  return {
    id: sessionData.user.id,
    username: sessionData.user.login || sessionData.user.username,
    provider: sessionData.provider || 'github', // Support multiple
    // ... rest of fields
  };
}
```

## API Reference

### Server-Side Functions

#### `getSession(cookies: AstroCookies): AuthSession | null`

Get current session from cookies.

```typescript
const session = getSession(Astro.cookies);
if (session) {
  console.log(session.user.username);
}
```

#### `requireAuth(cookies, redirect, redirectTo?): AuthSession`

Require authentication, throw redirect if not authenticated.

```typescript
// Will redirect to '/' if not authenticated
const session = requireAuth(Astro.cookies, Astro.redirect);
```

#### `isAuthenticated(cookies: AstroCookies): boolean`

Simple boolean check.

```typescript
if (isAuthenticated(Astro.cookies)) {
  // User is logged in
}
```

### Client-Side Functions

#### `fetchSession(): Promise<AuthSession | null>`

Fetch session from server (source of truth).

```typescript
const session = await fetchSession();
```

#### `getCachedSession(): AuthSession | null`

Get session from sessionStorage cache (fast, may be stale).

```typescript
const cached = getCachedSession();
```

#### `useUnifiedAuth(): AuthContextType`

React hook for auth state.

```typescript
const { user, loading, login, logout, refreshSession } = useUnifiedAuth();
```

## Types

```typescript
interface User {
  id: number | string;
  username: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  provider: 'github' | 'gitlab' | 'google';
}

interface AuthSession {
  user: User;
  authenticated: boolean;
  accessToken?: string;
  expiresAt?: number;
}

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  login: (provider?: 'github') => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

## Best Practices

### ✅ DO

- Use `AuthGuard` for full Astro pages (fastest, most secure)
- Use middleware to protect entire route trees
- Access `Astro.locals.user` for server-rendered content
- Use `useUnifiedAuth()` hook in React components
- Check `loading` state before rendering
- Cache session data in sessionStorage for performance

### ❌ DON'T

- Don't store sensitive data in sessionStorage
- Don't skip the loading state in React
- Don't implement custom auth checks (use provided utilities)
- Don't mix old `AuthProvider` with new `UnifiedAuthProvider`
- Don't expose `accessToken` to client unless needed

## Migration from Old System

### Old `AuthProvider` → New `UnifiedAuthProvider`

**Before:**
```tsx
import { AuthProvider } from './components/AuthProvider';
<AuthProvider>{children}</AuthProvider>
```

**After:**
```tsx
import { UnifiedAuthProvider } from './lib/auth-context';
<UnifiedAuthProvider>{children}</UnifiedAuthProvider>
```

### Old `AuthenticatedForm` → New `RequireAuth`

**Before:**
```tsx
<AuthenticatedForm formType="wishlist">
  <WishlistForm />
</AuthenticatedForm>
```

**After:**
```tsx
<RequireAuth>
  <WishlistForm />
</RequireAuth>
```

## Troubleshooting

### "Session expired" error
- Sessions last 24 hours
- User needs to log in again
- Clear sessionStorage and cookies

### Flash of unauthenticated content
- Use `AuthGuard` for server-side protection
- Check loading state in React components

### Middleware not protecting routes
- Verify route path matches exactly in `PROTECTED_ROUTES`
- Check base path is handled correctly
- Restart dev server after middleware changes

### Can't access user in Astro page
- Make sure middleware is running
- Access via `Astro.locals.user` (not `Astro.session`)
- Check `isAuthenticated(Astro.cookies)` first

## Environment Variables

Required for authentication:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:4324/auth/callback

# Session signing
OAUTH_STATE_SECRET=your_secret_key_min_32_chars
```

## Testing

### Test Authentication Manually

1. Go to `/api/auth/github`
2. Authorize on GitHub
3. Should redirect to `/maintainers?auth=success`
4. Check browser cookies for `oss_auth_session`
5. Check sessionStorage for `oss_auth_cache`

### Test Protected Routes

1. Log out (clear cookies)
2. Try accessing `/maintainers`
3. Should redirect to `/`
4. Log in and try again
5. Should see content

## Summary

- **Centralized**: Single source of truth in `src/lib/auth.ts`
- **Flexible**: Works server-side and client-side
- **Secure**: httpOnly cookies, signed sessions, CSRF protection
- **Extensible**: Easy to add new OAuth providers
- **Performance**: Client-side caching with server verification
- **Type-safe**: Full TypeScript support
