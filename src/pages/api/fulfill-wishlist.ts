import type { APIRoute } from 'astro';

export const prerender = false;

// Simple email sending function (you can replace this with your preferred email service)
async function sendEmail(to: string, subject: string, body: string) {
  // For development, we'll just log the email content
  // In production, you'd integrate with SendGrid, Resend, Nodemailer, etc.
  console.log('=== EMAIL NOTIFICATION ===');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
  console.log('========================');
  
  // You can replace this with actual email sending logic
  // Example with fetch to a webhook or email API:
  /*
  const response = await fetch('YOUR_EMAIL_WEBHOOK_URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body })
  });
  return response.ok;
  */
  
  return true; // Simulate success for now
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    // Get all selected services from checkboxes
    const fundedServices = formData.getAll('funded-services');
    
    const fulfillmentData = {
      wishlist: formData.get('wishlist'),
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

    // Get email recipient from environment variables
    const emailTo = import.meta.env.EMAIL_TO || import.meta.env.EMAIL_FROM || 'emma@example.com';
    
    // Create email content
    const emailSubject = `New OSS Wishlist Fulfillment Request: ${fulfillmentData.wishlist}`;
    const emailBody = `
New OSS Wishlist Fulfillment Request Received

WISHLIST DETAILS:
Project: ${fulfillmentData.wishlist}
Timeline: ${fulfillmentData.timeline}

CONTACT INFORMATION:
Name: ${fulfillmentData.contactPerson}
Email: ${fulfillmentData.email}
Company: ${fulfillmentData.company}

SELECTED SERVICES:
${fundedServices.length > 0 ? fundedServices.map(service => `• ${service}`).join('\n') : 'None selected'}

ADDITIONAL ITEMS:
${fulfillmentData.additionalItems || 'None specified'}

EXPERT SELECTION:
Choice: ${fulfillmentData.practitionerChoice}
${fulfillmentData.practitionerChoice === 'select' ? `Selected Practitioner: ${fulfillmentData.selectedPractitioner}` : ''}
${fulfillmentData.practitionerChoice === 'provide' ? `Custom Practitioner: ${fulfillmentData.customPractitionerName}` : ''}

REASON FOR FULFILLMENT:
${fulfillmentData.reason}

PROCESS AGREEMENT: ${fulfillmentData.processAgreement ? 'Agreed' : 'Not agreed'}

Submitted: ${fulfillmentData.timestamp}
    `.trim();

    // Send email notification
    const emailSent = await sendEmail(emailTo, emailSubject, emailBody);
    
    if (!emailSent) {
      throw new Error('Failed to send email notification');
    }

    // Log the submission
    console.log('Fulfillment request processed successfully:', fulfillmentData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Fulfillment request submitted successfully! We will review your request and get back to you soon.',
      data: fulfillmentData
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error processing fulfillment request:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to process fulfillment request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};