# OSS Wishlist Website

A platform connecting open source maintainers with supporters and practitioners who can help with project needs. Built with Astro, Tailwind CSS, and React.

## 🚀 Setting up your dev environment

### Prerequisites
- Node.js (v18+ recommended)
- npm 
- Git
- GitHub account (for API access)

### Step-by-step setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/oss-wish-list/oss-wishlist-website.git
   cd oss-wishlist-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your configuration:
   
   ```env
   # Required: GitHub Personal Access Token
   # Create one at: https://github.com/settings/tokens/new
   # Needs 'repo' scope for creating issues
   GITHUB_TOKEN=your_github_token_here
   
   # GitHub OAuth (optional - only needed for user authentication)
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   GITHUB_REDIRECT_URI=http://localhost:4323/oss-wishlist-website/auth/callback
   
   # Email settings (optional)
   EMAIL_FROM=noreply@oss-wishlist.com
   EMAIL_TO=your_email@example.com
   
   # Environment
   NODE_ENV=development
   PUBLIC_SITE_URL=http://localhost:4323/oss-wishlist-website
   BASE_URL=http://localhost:4323/oss-wishlist-website
   ```

   **🔑 Creating a GitHub Token:**
   1. Go to [GitHub Settings > Personal access tokens](https://github.com/settings/tokens/new)
   2. Click "Generate new token (classic)"
   3. Give it a name like "OSS Wishlist Dev"
   4. Select scopes: `repo` (for creating issues)
   5. Copy the token and paste it in your `.env` file

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The server will automatically find an available port (usually 4323+) and display the URLs:
   ```
   Local:    http://localhost:4335/oss-wishlist-website
   Network:  http://172.27.233.228:4335/oss-wishlist-website
   ```

5. **You're ready!** Open the Local URL in your browser.

### Quick Start (Demo Mode)
If you just want to see the site without GitHub integration:
```bash
git clone https://github.com/oss-wish-list/oss-wishlist-website.git
cd oss-wishlist-website
npm install
npm run dev
```
The site will work for browsing, but wishlist creation will be disabled without a GitHub token.

## 🎯 What This Platform Does

- **For Maintainers**: Create wishlists describing what help your project needs
- **For Practitioners**: Browse projects that need your expertise 
- **For Ecosystem Guardians**: Support critical open source infrastructure
- **Service Catalog**: Browse available services and expertise areas

## 🛠️ Tech Stack

- **Astro** (v4.x) - Static site framework
- **Tailwind CSS** - Styling
- **React** - Interactive components
- **Markdown** - Content management

## � Key Files & Folders

```
src/
├── pages/                 # Website pages
│   ├── index.astro       # Homepage
│   ├── practitioners.astro # Browse practitioners
│   ├── maintainers.astro  # Create wishlists
│   └── ecosystem-guardians.astro # Guardian info
├── content/              # Content collections (markdown files)
│   ├── practitioners/    # Practitioner profiles
│   ├── guardians/        # Guardian organizations
│   ├── services/         # Available services
│   ├── wishlists/        # Project wishlists
│   └── faq/              # FAQ entries
└── components/           # Reusable components
```

## 🎨 Making Changes

### Adding Content
All content is in markdown files under `src/content/`:

- **New Practitioner**: Add file to `src/content/practitioners/`
- **New Service**: Add file to `src/content/services/`
- **New FAQ**: Add file to `src/content/faq/`
- **New Guardian**: Add file to `src/content/guardians/`

### Updating Pages
Main pages are in `src/pages/` as `.astro` files. Edit directly and save - the dev server will auto-reload.

### Environment Variables
Copy `.env` file for any API keys or configuration. The site works without setup for demo purposes.

## 🚀 Deployment

```bash
npm run build    # Build for production
npm run preview  # Preview built site locally
```

## � Common Issues

**Port already in use?** The dev server will automatically try different ports (4323, 4324, 4325, etc.)

**Changes not showing?** The dev server auto-reloads, but try refreshing your browser.

**Content not loading?** Check the markdown frontmatter matches the schema in `src/content/config.ts`

## 📝 Quick Reference

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run preview  # Preview production build
```

### Key URLs (when running locally)
- **Homepage**: `/` - Main landing page
- **For Maintainers**: `/maintainers` - Create project wishlists
- **Practitioners**: `/practitioners` - Browse available practitioners
- **Ecosystem Guardians**: `/ecosystem-guardians` - Guardian organizations
- **FAQ**: `/faq` - Frequently asked questions
- **Service Catalog**: `/catalog` - Browse all services

### Content Structure Example
```markdown
---
# Frontmatter (metadata)
name: "Example Person"
specialties: ["Security", "Community"]
---

# Content goes here in markdown
This person specializes in...
```

---

## 📚 Additional Info

### Project Status
This is a working demo platform connecting open source maintainers with practitioners and ecosystem guardians.

### Contributing
The platform uses markdown-based content management. To add new content, create markdown files in the appropriate `src/content/` subdirectory.

### Support
For questions about setup or deployment, check the git history for configuration details or contact the development team.

