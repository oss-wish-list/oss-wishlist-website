# GitHub Pages Setup Instructions

## Quick Setup

Your OSS Wishlist website is now configured for GitHub Pages deployment! Here's what you need to do:

## 1. Enable GitHub Pages in Repository Settings

1. Go to your repository: `https://github.com/oss-wish-list/oss-wishlist-website`
2. Click on **Settings** tab
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Save the changes

## 2. Deployment Process

- **Automatic Deployment**: The site will automatically deploy when you push to the `astro` branch
- **Build Status**: Check the Actions tab to see deployment progress
- **Site URL**: Your site will be available at: `https://oss-wish-list.github.io/oss-wishlist-website`

## 3. Verify Deployment

After pushing changes:
1. Go to **Actions** tab in your repository
2. Look for the "Deploy to GitHub Pages" workflow
3. Wait for it to complete (usually 2-5 minutes)
4. Visit your site URL to see the changes

## 4. Local Development with GitHub Pages Path

To test how your site will look on GitHub Pages locally:

```bash
npm run build:gh-pages
npm run preview
```

This builds the site with the correct base path (`/oss-wishlist-website`) that GitHub Pages uses.

## 5. Important Notes

- **Branch**: The workflow is configured to deploy from the `astro` branch
- **Base Path**: All links and assets are configured for the `/oss-wishlist-website` path
- **Build Time**: First deployment may take a few extra minutes

## 6. Custom Domain (Optional)

If you want to use a custom domain:
1. Add a `CNAME` file to the `public/` directory with your domain
2. Update the `site` property in `astro.config.mjs`
3. Remove or update the `base` property as needed

## 7. Troubleshooting

- **404 Errors**: Check that the base path is correctly configured
- **Build Failures**: Check the Actions tab for error details
- **Assets Not Loading**: Ensure all asset paths use Astro's path helpers

## Current Configuration

- **Site URL**: `https://oss-wish-list.github.io`
- **Base Path**: `/oss-wishlist-website`
- **Deploy Branch**: `astro`
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`

Your site should be live shortly after the GitHub Actions workflow completes!