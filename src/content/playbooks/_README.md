# Playbooks Directory

This directory contains practitioner playbooks synced from the [wishlist-playbooks](https://github.com/oss-wishlist/wishlist-playbooks) repository.

## Structure

Each playbook is a markdown file with Astro frontmatter:

```yaml
---
title: "Playbook Title"
description: "Brief description"
service: "related-service-slug"
github_folder: "folder-name-in-external-repo"
order: 1
---
```

## Syncing

Run `./scripts/sync-playbooks.sh` to update playbooks from the external repository.

## Manual Edits

Files in this directory can be manually edited, but will be overwritten when the sync script runs.
To persist changes, update the source files in the [wishlist-playbooks repo](https://github.com/oss-wishlist/wishlist-playbooks).
