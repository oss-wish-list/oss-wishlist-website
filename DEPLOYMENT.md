# Digital Ocean Deployment Guide

## Environment Variables to Set in Digital Ocean

### **REQUIRED - Set these in Digital Ocean App Platform:**

Go to: **Settings → App-Level Environment Variables**

#### **For Placeholder Mode (Coming Soon Page):**
```bash
HOST=0.0.0.0
PORT=8080
PUBLIC_SITE_MODE=placeholder
NODE_ENV=production
```

#### **For Full Site Launch:**
```bash
HOST=0.0.0.0
PORT=8080
PUBLIC_SITE_MODE=full
NODE_ENV=production
GITHUB_TOKEN=your_github_personal_access_token
```

### **Optional - For GitHub OAuth (User Login):**
```bash
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
GITHUB_REDIRECT_URI=https://your-app-url.ondigitalocean.app/api/auth/github
OAUTH_STATE_SECRET=random_secure_string_min_32_characters
```

### **Optional - For Email Notifications:**
```bash
EMAIL_FROM=your-email@example.com
EMAIL_TO=notifications@example.com
```

---

## Recent Fix Applied

### **Problem:**
- Digital Ocean was running `astro dev` (development server) on port 4324
- Health checks expected production server on port 8080
- Result: Connection refused errors

### **Solution:**
Updated `package.json` to run the production Node.js server:
```json
"start": "node ./dist/server/entry.mjs"
```

The build process now:
1. Runs `npm run build` → Creates `dist/` folder with server
2. Runs `npm start` → Starts Node.js server on PORT 8080
3. Serves hybrid static + SSR content

---

## How Environment Variables Work

### **PORT and HOST:**
- Digital Ocean expects apps to listen on port **8080**
- The Node adapter reads `PORT` and `HOST` environment variables
- Must set: `HOST=0.0.0.0` and `PORT=8080`

### **PUBLIC_SITE_MODE:**
- Controls which homepage to display
- `placeholder` = "Coming November 2025" page
- `full` = Complete website with all features

### **GITHUB_TOKEN:**
- Only needed for full site mode
- Used by API endpoints to create GitHub issues
- Create at: https://github.com/settings/tokens/new
- Required scope: `repo`

### **GitHub OAuth (optional):**
- Only needed if you want users to log in with GitHub
- Create OAuth App at: https://github.com/settings/developers
- Set Authorization callback URL to: `https://your-app.ondigitalocean.app/api/auth/github`

---

## Deployment Checklist

- [ ] Set `HOST=0.0.0.0` in Digital Ocean
- [ ] Set `PORT=8080` in Digital Ocean
- [ ] Set `PUBLIC_SITE_MODE=placeholder` (or `full` when ready)
- [ ] Set `NODE_ENV=production` in Digital Ocean
- [ ] Push latest code changes (already done ✅)
- [ ] Monitor build logs for success
- [ ] Visit deployed URL to verify
- [ ] (When ready) Switch `PUBLIC_SITE_MODE=full` and add `GITHUB_TOKEN`

---

## Testing Locally

To test the production build locally:

```bash
# Build the site
npm run build

# Set environment variables
export HOST=0.0.0.0
export PORT=8080
export PUBLIC_SITE_MODE=placeholder

# Start production server
npm start

# Visit: http://localhost:8080
```

---

## Troubleshooting

### **Connection refused on port 8080:**
- ✅ FIXED: Updated `package.json` start script
- Ensure `HOST` and `PORT` are set in Digital Ocean

### **Showing wrong page (placeholder vs full):**
- Check `PUBLIC_SITE_MODE` environment variable
- Redeploy after changing env vars

### **API routes not working:**
- Ensure `GITHUB_TOKEN` is set (for full mode)
- Check that all API routes have `export const prerender = false`

### **OAuth errors:**
- Verify all GitHub OAuth env vars are set
- Check redirect URI matches exactly
- Ensure OAuth app is configured in GitHub
