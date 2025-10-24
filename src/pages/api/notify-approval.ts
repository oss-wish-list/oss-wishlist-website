import type { APIRoute } from 'astro';
import { sendEmail } from '../../lib/mail';
import { GITHUB_CONFIG } from '../../config/github';

export const prerender = false;

/**
 * API endpoint to notify maintainer when their wishlist is approved
 * Called by GitHub Action when 'approved-wishlist' label is added
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { issueNumber, maintainerEmail } = body;

    if (!issueNumber) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Issue number is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get GitHub token from environment
    const githubToken = import.meta.env.GITHUB_TOKEN;
    if (!githubToken) {
      return new Response(JSON.stringify({
        error: 'Configuration Error',
        message: 'GitHub token not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch the issue details from GitHub
    const issueResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_CONFIG.ORG}/${GITHUB_CONFIG.REPO}/issues/${issueNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'OSS-Wishlist-Bot'
        }
      }
    );

    if (!issueResponse.ok) {
      return new Response(JSON.stringify({
        error: 'GitHub API Error',
        message: 'Failed to fetch issue details'
      }), {
        status: issueResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const issue = await issueResponse.json();
    const projectTitle = issue.title.replace(/^Wishlist:\s*/i, '').trim();
    const maintainerUsername = issue.user.login;

    // Construct URLs
    const origin = import.meta.env.PUBLIC_SITE_URL || 'https://oss-wishlist.com';
    const basePath = import.meta.env.PUBLIC_BASE_PATH || '';
    const wishlistUrl = `${origin}${basePath}fulfill?issue=${issueNumber}`;
    const manageUrl = `${origin}${basePath}maintainers`;

    // Determine email recipient
    let recipientEmail = maintainerEmail;
    if (!recipientEmail) {
      // Try to get email from issue body or use GitHub public email
      // For now, we'll need the email passed from the GitHub Action
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: 'Maintainer email is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send approval notification email
    const emailSubject = `✅ Your OSS Wishlist for "${projectTitle}" has been approved!`;
    
    const emailText = `
Congratulations! Your wishlist for "${projectTitle}" has been approved and is now visible to sponsors.

🎉 What This Means:
- Your wishlist is now publicly visible on the OSS Wishlist platform
- Sponsors can discover your needs and offer support
- Your project data is included in our public JSON feed for ecosystem discovery tools
- Your FUNDING.yml file will be created (if requested)

🔗 Your Wishlist:
${wishlistUrl}

📊 Next Steps:
1. Share your wishlist URL with potential sponsors
2. Monitor your GitHub issue for sponsor inquiries
3. Manage your wishlist status at: ${manageUrl}

💡 Tips for Success:
- Respond promptly to sponsor inquiries
- Keep your wishlist updated as needs change
- Consider adding more detail about your project's impact
- Join our community: https://join.slack.com/t/opensourcewishlist/shared_invite/zt-3dvyh48xf-y6uqKHyd6Ur~WfkcawReuQ

Questions? Reply to this email or reach out in our community.

Best regards,
The OSS Wishlist Team
    `.trim();

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .section { margin: 20px 0; }
    .section-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 10px; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 Wishlist Approved!</h1>
    </div>
    <div class="content">
      <p>Congratulations, <strong>@${maintainerUsername}</strong>!</p>
      <p>Your wishlist for <strong>"${projectTitle}"</strong> has been approved and is now visible to sponsors.</p>
      
      <div class="section">
        <div class="section-title">✨ What This Means:</div>
        <ul>
          <li>Your wishlist is now publicly visible on the OSS Wishlist platform</li>
          <li>Sponsors can discover your needs and offer support</li>
          <li>Your project data is included in our public JSON feed for ecosystem discovery tools</li>
          <li>Your FUNDING.yml file will be created (if requested)</li>
        </ul>
      </div>

      <div style="text-align: center;">
        <a href="${wishlistUrl}" class="button">View Your Wishlist</a>
      </div>

      <div class="section">
        <div class="section-title">📊 Next Steps:</div>
        <ul>
          <li>Share your wishlist URL with potential sponsors</li>
          <li>Monitor your GitHub issue for sponsor inquiries</li>
          <li>Manage your wishlist status at <a href="${manageUrl}">your dashboard</a></li>
        </ul>
      </div>

      <div class="section">
        <div class="section-title">💡 Tips for Success:</div>
        <ul>
          <li>Respond promptly to sponsor inquiries</li>
          <li>Keep your wishlist updated as needs change</li>
          <li>Consider adding more detail about your project's impact</li>
          <li><a href="https://join.slack.com/t/opensourcewishlist/shared_invite/zt-3dvyh48xf-y6uqKHyd6Ur~WfkcawReuQ">Join our community</a></li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p>Questions? Reply to this email or reach out in our community.</p>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
        You received this email because you submitted a wishlist on OSS Wishlist.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    if (!emailResult.success) {
      console.error('Failed to send approval notification:', emailResult.error);
      return new Response(JSON.stringify({
        error: 'Email Failed',
        message: 'Failed to send approval notification email',
        details: emailResult.error
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Approval notification sent successfully',
      emailSent: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error sending approval notification:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
