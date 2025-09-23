# OSS Wishlist Website

A platform connecting open source maintainers with supporters and companies seeking open source services. Built with Astro, Tailwind CSS, and React.

## 🚀 Features

- **Dual Audience Platform**: Separate offerings for maintainers and companies
- **Wishlist System**: Maintainers can create project wishlists for needed services
- **Service Discovery**: Browse available services by category and audience
- **GitHub Integration**: Wishlists are created as GitHub issues for transparency
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Content Management**: Markdown-based content with Astro Collections

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/) (v4.x)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Interactive Components**: [React](https://reactjs.org/)
- **Content**: Markdown with frontmatter
- **Deployment**: Static site generation

## 📋 Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Git

## 🏃‍♂️ Quick Start

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
   Edit `.env` to add your configuration (optional for local development).

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:4321`

## 📁 Project Structure

```
/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout.astro   # Main layout wrapper
│   │   └── WishlistForms.tsx # React form component
│   ├── content/           # Content collections
│   │   ├── services/      # Service markdown files
│   │   └── config.ts      # Content schema definitions
│   ├── pages/             # Route pages
│   │   ├── index.astro    # Homepage
│   │   ├── maintainers.astro # Maintainer landing
│   │   ├── companies.astro   # Company landing
│   │   ├── submit.astro      # Wishlist creation
│   │   ├── wishlists.astro   # Browse wishlists
│   │   ├── services/         # Service detail pages
│   │   └── wishlist/         # Individual wishlist pages
│   └── env.d.ts          # TypeScript environment types
├── astro.config.mjs      # Astro configuration
├── tailwind.config.mjs   # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🎯 Usage

### For Maintainers

1. **Browse Services**: Visit `/maintainers` to see available services
2. **Create Wishlist**: Use `/submit` to create a project wishlist
3. **Submit to GitHub**: Wishlists are automatically formatted as GitHub issues

### For Companies

1. **Explore Services**: Visit `/companies` to see enterprise services
2. **Contact Providers**: Use service pages to connect with providers

### For Service Providers

1. **Add Services**: Create markdown files in `src/content/services/`
2. **Update Schema**: Ensure services include required frontmatter fields

## 📝 Content Management

### Adding New Services

Create a new markdown file in `src/content/services/` with the following frontmatter:

```markdown
---
title: "Service Title"
description: "Brief service description"
category: "Governance" # See schema for valid options
target_audience: "maintainer" # "maintainer", "company", or "both"
service_type: "consulting" # See schema for valid options
price_tier: "medium" # "low", "medium", "high", "enterprise"
estimated_hours: "8-12 hours"
tags: ["tag1", "tag2"]
featured: true # Optional
prerequisites: "Any prerequisites" # Optional
deliverables: # Optional
  - "Deliverable 1"
  - "Deliverable 2"
---

## Service content goes here...
```

### Content Schema

Services must include these required fields:
- `title`: Service name
- `description`: Brief description
- `category`: One of the predefined categories
- `target_audience`: "maintainer", "company", or "both"
- `service_type`: Type of service offering
- `price_tier`: Pricing level
- `estimated_hours`: Time estimate

See `src/content/config.ts` for complete schema and valid values.

## 🧩 Components

### WishlistForms.tsx

React component for creating project wishlists:
- Form validation
- Service selection
- GitHub integration
- Responsive design

### Layout.astro

Main layout component providing:
- Navigation header
- Responsive design
- SEO meta tags
- Footer

## 🚀 Deployment

All GitHub Actions workflows in this repository are currently STUBBED (no-op) while early development focuses on content and structure. They only echo a message and do not build, deploy, or transform issues.

To re-enable any workflow:
1. Open the corresponding file in `.github/workflows/`.
2. Replace the single `noop` job with the previous logic (retrieve from git history if needed).
3. Commit and push. Recreate any required branch protection status checks.
4. Push a test commit to ensure the workflow runs as expected.

### Build for Production

```bash
npm run build
```

The site will be built to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to GitHub Pages (Disabled / Stubbed)

This project was previously configured for automatic deployment to GitHub Pages. The deployment workflow files are currently stubbed.

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" in the sidebar
   - Under "Source", select "GitHub Actions"

2. **Configure Repository**:
   - Ensure the `astro` branch is your main development branch
   - The workflow will automatically deploy when you push to `astro`

3. **Access Your Site**:
   - Your site will be available at: `https://oss-wish-list.github.io/oss-wishlist-website`
   - Updates are deployed automatically on every push to `astro`

4. **Local Testing for GitHub Pages**:
   ```bash
   npm run build:gh-pages
   npm run preview
   ```

## 🚀 Deployment Options

You can deploy this site to GitHub Pages using either of two methods:

### Option A: GitHub Pages Native (Actions Pages Pipeline) [Currently Disabled]
Uses the `deploy.yml` workflow with the GitHub Pages infrastructure.

Pros:
- Integrated environment & history
- Automatic HTTPS and custom domain support
- Uses Pages deployment UI

Cons:
- Currently may surface a deprecated `upload-artifact v3` warning if upstream actions internally still reference it.

### Option B: gh-pages Branch (Classic Push) [Currently Disabled]
Uses `deploy-gh-pages.yml` to build and push static files to a `gh-pages` branch.

Pros:
- Bypasses Pages artifact pipeline entirely
- No dependency on internal artifact action versions
- Simple and transparent

Cons:
- No Pages build logs in UI
- Must manage base path manually

### Switching Between Methods (When Re-enabled)

1. Go to GitHub repository Settings → Pages.
2. Choose Source:
   - For Option A: Select GitHub Actions.
   - For Option B: Select Deploy from Branch → `gh-pages` branch → `/ (root)`.
3. Commit and push to `astro` branch to trigger deployment.

### Local Test with Base Path
If deploying under a repository subpath (Pages default for org/user project sites):
```bash
npm run build
npm run preview
```
(Already configured via `base` in `astro.config.mjs` if needed.)

### Troubleshooting (When Workflows Re-enabled)
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Deprecated upload-artifact v3 warning | Internal Pages pipeline action | Switch to gh-pages workflow (Option B) |
| 404 for assets after branch deploy | Missing/incorrect `base` config | Set `base` in `astro.config.mjs` or remove if using apex/custom domain |
| Site not updating | Wrong Pages source selected | Reconfigure Pages settings |

---

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run astro` - Run Astro CLI commands

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Add your environment variables here
# GITHUB_TOKEN=your_token_here
```

### Code Style

- Use TypeScript for type safety
- Follow Astro conventions for file organization
- Use Tailwind CSS for styling
- Keep components small and focused

## 🐛 Troubleshooting

### Common Issues

1. **Node.js Version**: Ensure you're using Node.js v18+
2. **Cache Issues**: Clear node_modules and reinstall if needed
3. **Port Conflicts**: Change port in `astro.config.mjs` if 4321 is taken
4. **Schema Errors**: Ensure all service files include required frontmatter

### Reset Development Environment

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Adding Services

To add new services:
1. Create a markdown file in `src/content/services/`
2. Follow the content schema requirements
3. Test locally before submitting PR
4. Update relevant pages if needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Hosted on [Netlify](https://netlify.com/)

## 📞 Support

- Create an issue for bugs or feature requests
- Join our Discord for community support
- Email: support@osswishlist.com

---

**Made with ❤️ for the open source community**