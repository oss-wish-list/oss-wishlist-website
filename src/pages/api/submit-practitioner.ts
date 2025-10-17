import type { APIRoute } from 'astro';
import { sendAdminEmail } from '../../lib/mail';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Generate slug from name (lowercase, replace spaces with hyphens)
    const slug = body.fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Format practitioner data as markdown matching the schema
    const markdownContent = `---
name: "${body.fullName}"
title: "${body.title || ''}"
company: "${body.company || ''}"
bio: "${body.bio || ''}"
avatar_url: ""
location: "${body.location || ''}"
languages: ["English"]

email: "${body.email}"
website: "${body.website || ''}"
github: "${body.github || ''}"
github_sponsors: ""
mastodon: "${body.mastodon || ''}"
linkedin: "${body.linkedin || ''}"

specialties: 
${body.specialties && body.specialties.length > 0 ? body.specialties.map((s: string) => `  - "${s}"`).join('\n') : '  - ""'}
${body.otherSpecialties ? `\n# Other specialties: ${body.otherSpecialties}` : ''}

availability: "${body.availability || 'available'}"
accepts_pro_bono: ${body.proBono === 'on' || body.proBono === true ? 'true' : 'false'}
pro_bono_criteria: "${body.proBonoCriteriaText || ''}"
pro_bono_capacity_per_month: ${body.proBonoCapacity || 0}

# GitHub Sponsors tiers matching service names (one-time payment in USD)
sponsor_tiers:
  # Add service pricing here

years_experience: ${body.experience || 0}
notable_experience: 
${body.projects ? body.projects.split('\n').map((p: string) => `  - "${p.trim()}"`).join('\n') : '  - ""'}
certifications: 
  - ""

verified: false
---

## About ${body.fullName}

${body.bio || ''}

${body.additionalInfo ? `\n## Additional Information\n\n${body.additionalInfo}` : ''}

## Pro Bono Criteria
${body.proBono === 'on' || body.proBono === true ? `
${body.fullName} accepts some Pro Bono requests.

${body.proBonoCriteriaText || 'Criteria to be determined'}

Capacity: ${body.proBonoCapacity || 0} contracts per month
` : `${body.fullName} does not currently accept Pro Bono requests.`}
`;

    // Email subject
    const subject = `New Practitioner Application: ${body.fullName}`;
    
    // Email body with markdown and instructions
    const emailBody = `
New practitioner application received from ${body.fullName}.

SUGGESTED FILENAME: ${slug}-practitioner.md

To add this practitioner to the site, create a new file at:
src/content/practitioners/${slug}-practitioner.md

With the following content:

---BEGIN MARKDOWN---

${markdownContent}

---END MARKDOWN---

Application Details:
- Name: ${body.fullName}
- Email: ${body.email}
- Title: ${body.title}
- Company: ${body.company || 'N/A'}
- Location: ${body.location || 'N/A'}
- Experience: ${body.experience} years
- GitHub: ${body.github ? `https://github.com/${body.github}` : 'N/A'}
- LinkedIn: ${body.linkedin || 'N/A'}
- Website: ${body.website || 'N/A'}
- Availability: ${body.availability}
- Pro Bono: ${body.proBono === 'on' || body.proBono === true ? 'Yes' : 'No'}

Specialties: ${body.specialties?.join(', ') || 'None selected'}
${body.otherSpecialties ? `Other Specialties: ${body.otherSpecialties}` : ''}

Notable Projects/Experience:
${body.projects || 'N/A'}

${body.additionalInfo ? `Additional Information:\n${body.additionalInfo}` : ''}
`;

    // Send email using centralized mail service
    const emailResult = await sendAdminEmail(subject, emailBody);
    
    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to send notification email: ' + emailResult.error 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Application submitted successfully',
      slug: slug,
      emailProvider: emailResult.provider
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error submitting practitioner application:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
