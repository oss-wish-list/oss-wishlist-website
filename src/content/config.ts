import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      'Governance', 
      'Community', 
      'Security', 
      'Developer Relations', 
      'Leadership',
      'Training',
      'Consulting',
      'Auditing',
      'Support'
    ]),
    target_audience: z.enum(['maintainer', 'company', 'both']),
    service_type: z.enum([
      'one-time',
      'ongoing', 
      'workshop',
      'consulting',
      'audit',
      'training',
      'support'
    ]),
    price_tier: z.enum(['low', 'medium', 'high', 'enterprise']),
    estimated_hours: z.string(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    prerequisites: z.string().optional(),
    deliverables: z.array(z.string()).optional(),
  }),
});

const wishlists = defineCollection({
  type: 'content',
  schema: z.object({
    project_name: z.string(),
    username: z.string(),
    repo_url: z.string().url(),
    contact_email: z.string().email(),
    organization_type: z.enum(['individual', 'company', 'nonprofit']).default('individual'),
    company_size: z.enum(['startup', 'small', 'medium', 'enterprise']).optional(),
    services: z.array(z.string()),
    created_date: z.date(),
    status: z.enum(['active', 'fulfilled', 'paused']).default('active'),
    budget_range: z.enum(['under-1k', '1k-5k', '5k-20k', '20k-plus']).optional(),
  }),
});

export const collections = {
  services,
  wishlists,
};