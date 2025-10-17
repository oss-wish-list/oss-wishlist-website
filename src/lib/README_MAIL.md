# Email Service

Centralized email functionality for OSS Wishlist.

## Quick Start

```typescript
import { sendAdminEmail } from './mail';

// Send to admin
await sendAdminEmail('Subject', 'Body text');
```

## Configuration

Required in `.env`:
```bash
ADMIN_EMAIL=admin@example.com
RESEND_API_KEY=re_your_key  # or SENDGRID_API_KEY
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

## Functions

- `sendEmail(options)` - Send to any address
- `sendAdminEmail(subject, text)` - Send to admin
- `isEmailConfigured()` - Check if ready
- `getEmailConfig()` - Get current settings

See `/copilot_notes/EMAIL_SYSTEM.md` for full documentation.
