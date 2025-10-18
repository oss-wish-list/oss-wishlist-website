/// <reference path="../.astro/types.d.ts" />

import type { AuthSession, User } from './lib/auth';

interface ImportMetaEnv {
  readonly GITHUB_TOKEN: string;
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
  readonly GITHUB_REDIRECT_URI: string;
  readonly OAUTH_STATE_SECRET: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_PUBLISHABLE_KEY: string;
  readonly DATABASE_URL: string;
  readonly EMAIL_API_KEY: string;
  readonly EMAIL_FROM: string;
  readonly JWT_SECRET: string;
  readonly SESSION_SECRET: string;
  readonly DISCORD_WEBHOOK_URL: string;
  readonly SLACK_WEBHOOK_URL: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    session: AuthSession | null;
    user: User | null;
  }
}