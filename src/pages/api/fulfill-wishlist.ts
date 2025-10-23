import type { APIRoute } from 'astro';
import { sendAdminEmail } from '../../lib/mail';
import { withBasePath } from '../../lib/paths';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    
    // Get all selected services from checkboxes
    const fundedServices = formData.getAll('funded-services');
    
    // Get project name and issue details
    const projectName = formData.get('project-name') as string;
    const issueNumber = formData.get('issue-number') as string;
    const githubUrl = formData.get('github-url') as string;
    const maintainer = formData.get('maintainer') as string;
    
    const fulfillmentData = {
      projectName: projectName,
      issueNumber: issueNumber,
      githubUrl: githubUrl,
      maintainer: maintainer,
      fundedServices: fundedServices,
      additionalItems: formData.get('additional-items'),
      practitionerChoice: formData.get('practitioner-choice'),
      selectedPractitioner: formData.get('selected-practitioner'),
      customPractitionerName: formData.get('custom-practitioner-name'),
      processAgreement: formData.get('process-agreement'),
      timeline: formData.get('timeline'),
      contactPerson: formData.get('contact-person'),
      email: formData.get('email'),
      company: formData.get('company'),
      reason: formData.get('reason'),
      timestamp: new Date().toISOString()
    };

    // Create email subject
    const emailSubject = `🎉 New Wishlist Fulfillment Request: ${projectName}`;
    
    // Create email content
    const emailBody = `
# New OSS Wishlist Fulfillment Request Received

## WISHLIST DETAILS
- **Project:** ${projectName}
- **Issue Number:** #${issueNumber}
- **GitHub URL:** ${githubUrl}
- **Maintainer:** @${maintainer}
- **Timeline:** ${fulfillmentData.timeline}

## CONTACT INFORMATION
- **Name:** ${fulfillmentData.contactPerson}
- **Email:** ${fulfillmentData.email}
- **Company:** ${fulfillmentData.company || 'Not specified'}

## SELECTED SERVICES
${fundedServices.length > 0 ? fundedServices.map(service => `- ${service}`).join('\n') : '- None selected'}

## ADDITIONAL ITEMS
${fulfillmentData.additionalItems || 'None specified'}

## EXPERT SELECTION
- **Choice:** ${fulfillmentData.practitionerChoice}
${fulfillmentData.practitionerChoice === 'select' ? `- **Selected Practitioner:** ${fulfillmentData.selectedPractitioner}` : ''}
${fulfillmentData.practitionerChoice === 'provide' ? `- **Custom Practitioner:** ${fulfillmentData.customPractitionerName}` : ''}

## REASON FOR FULFILLMENT
${fulfillmentData.reason}

## PROCESS AGREEMENT
${fulfillmentData.processAgreement ? '✅ Agreed' : '❌ Not agreed'}

---
*Submitted: ${new Date(fulfillmentData.timestamp).toLocaleString()}*
    `.trim();

    // Send email notification using centralized mail service
    const emailResult = await sendAdminEmail(emailSubject, emailBody);
    
    if (!emailResult.success) {
      console.error('Failed to send fulfillment email:', emailResult.error);
      return redirect(withBasePath(`fulfill?issue=${issueNumber}&error=email_failed`));
    }

    // Redirect to success page
    return redirect(withBasePath('fulfill-success'));

  } catch (error) {
    console.error('Error processing fulfillment request:', error);
    return redirect(withBasePath('fulfill?error=submission_failed'));
  }
};