# Simple Authentication Guide

## Core Principle: ONE WAY TO DO AUTH

**Everything uses `src/lib/auth.ts`** - that's it!

## For Astro Pages (Server-Side)

### Check if user is logged in:
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

### Protect entire page (redirect if not logged in):
```astro
---
import AuthGuard from '../components/AuthGuard.astro';
---

<AuthGuard>
  <ProtectedContent />
</AuthGuard>
```

## For React Components (Client-Side)

### Simple button that checks auth:
```tsx
import { fetchSession } from '../lib/auth';

const [user, setUser] = useState(null);

useEffect(() => {
  fetchSession().then(session => setUser(session?.user));
}, []);
```

### Protected form wrapper:
```tsx
import AuthenticatedForm from '../components/AuthenticatedForm';

<AuthenticatedForm>
  <YourForm />
</AuthenticatedForm>
```

## Login/Logout

```tsx
import { getLoginUrl, getLogoutUrl } from '../lib/auth';
import { getApiPath } from '../config/app';

// Login
window.location.href = getApiPath(getLoginUrl('github'));

// Logout
await fetch(getApiPath(getLogoutUrl()), { method: 'POST' });
window.location.href = getApiPath('/');
```

## That's It!

No providers, no contexts, no complexity. Just:
1. `Astro.locals.user` for server-side
2. `fetchSession()` for client-side
3. `AuthenticatedForm` for protected forms
4. `AuthGuard` for protected pages
