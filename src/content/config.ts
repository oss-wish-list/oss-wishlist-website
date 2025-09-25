import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['service', 'resource']).default('service'),
    target_audience: z.enum(['maintainer', 'company', 'both']).optional(),
    service_type: z.enum([
      'one-time',
      'ongoing', 
      'workshop',
      'consulting',
      'audit',
      'training',
      'support',
      'credit',
      'budget',
      'hosting',
      'tool'
    ]),
    price_tier: z.enum(['low', 'medium', 'high', 'enterprise']).optional(),
    estimated_hours: z.string().optional(),
    estimated_value: z.string().optional(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    prerequisites: z.string().optional(),
    deliverables: z.array(z.string()).optional(),
  }),
});

const wishlists = defineCollection({
  type: 'content',
  schema: z.object({
    // Project Information
    project_name: z.string(),
    repo_url: z.string().url(),
    github_stars: z.number().optional(),
    monthly_downloads: z.string().optional(),
    project_stage: z.enum(['early', 'growing', 'mature', 'scaling', 'enterprise-ready']),
    technologies: z.array(z.string()),
    
    // Maintainer Information
    maintainer: z.object({
      username: z.string(),
      display_name: z.string(),
      email: z.string().email(),
      github_id: z.number(),
      avatar_url: z.string().url().optional(),
      bio: z.string().optional(),
    }),
    
    // Organization Details
    organization: z.object({
      type: z.enum(['individual', 'company', 'nonprofit', 'foundation']),
      name: z.string().optional(),
      size: z.enum(['startup', 'small', 'medium', 'enterprise']).optional(),
      website: z.string().url().optional(),
    }).optional(),
    
    // Wishlist Details
    services_needed: z.array(z.string()),
    preferred_experts: z.array(z.string()).optional(), // expert IDs
    urgency: z.enum(['low', 'medium', 'high']),
    timeline: z.string().optional(),
    budget_range: z.enum(['volunteer', 'under-1k', '1k-5k', '5k-20k', '20k-50k', '50k-plus', 'ongoing-sponsorship']).optional(),
    
    // Status & Metadata
    status: z.enum(['draft', 'active', 'in-progress', 'fulfilled', 'paused', 'archived']).default('active'),
    created_date: z.date(),
    updated_date: z.date().optional(),
    verified_maintainer: z.boolean().default(false),
    
    // Search & Discovery
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
  }),
});

const experts = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    title: z.string(),
    company: z.string().optional(),
    bio: z.string(),
    avatar_url: z.string().url().optional(),
    location: z.string().optional(),
    languages: z.array(z.string()).optional(),
    
    // Contact & Social
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    github: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    
    // Expertise
    specialties: z.array(z.string()),
    service_categories: z.array(z.enum([
      'Governance', 
      'Community', 
      'Security', 
      'Leadership'
    ])),
    technologies: z.array(z.string()).optional(),
    
    // Availability & Pricing
    availability: z.enum(['available', 'limited', 'unavailable']).default('available'),
    hourly_rate_range: z.enum(['volunteer', 'under-100', '100-200', '200-400', '400-plus', 'enterprise']).optional(),
    accepts_pro_bono: z.boolean().default(false),
    
    // Experience & Credentials
    years_experience: z.number().optional(),
    notable_projects: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    
    // Metadata
    featured: z.boolean().default(false),
    verified: z.boolean().default(false),
    joined_date: z.date(),
    tags: z.array(z.string()).optional(),
  }),
});

const guardians = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    type: z.enum(['individual', 'organization', 'foundation', 'company']),
    description: z.string(),
    logo_url: z.string().url().optional(),
    website: z.string().url().optional(),
    location: z.string().optional(),
    
    // Contact Information
    contact_email: z.string().email().optional(),
    github_org: z.string().optional(),
    social_media: z.object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      mastodon: z.string().optional(),
    }).optional(),
    
    // Guardian Focus
    focus_areas: z.array(z.enum([
      'Security Audits',
      'Dependency Management', 
      'Community Health',
      'Project Governance',
      'Sustainability',
      'Ecosystem Support',
      'Critical Infrastructure',
      'Open Source Funding'
    ])),
    supported_ecosystems: z.array(z.string()).optional(), // e.g., ['JavaScript', 'Python', 'Rust']
    
    // Programs & Services
    programs: z.array(z.string()).optional(),
    funding_available: z.boolean().default(false),
    provides_mentorship: z.boolean().default(false),
    provides_infrastructure: z.boolean().default(false),
    
    // Capacity & Scale
    size: z.enum(['individual', 'small-team', 'organization', 'enterprise']).optional(),
    projects_supported: z.number().optional(),
    annual_budget: z.enum(['under-10k', '10k-100k', '100k-1m', '1m-plus', 'undisclosed']).optional(),
    
    // Metadata
    established_date: z.date().optional(),
    featured: z.boolean().default(false),
    verified: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  services,
  wishlists,
  experts,
  guardians,
};