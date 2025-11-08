/**
 * Email Templates
 *
 * HTML email templates for authentication emails
 * (verification, password reset, etc.)
 */

/**
 * Base email HTML structure with styling
 */
function baseEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1a1a1a;
      font-size: 24px;
      margin: 0 0 10px 0;
    }
    .content {
      margin-bottom: 30px;
    }
    .content p {
      margin: 0 0 15px 0;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    .code {
      font-family: 'Courier New', Courier, monospace;
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning p {
      margin: 0;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="email-container">
    ${content}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email verification template
 *
 * @param userName - User's name
 * @param verificationUrl - Full verification URL with token
 * @returns HTML email content
 */
export function emailVerificationTemplate(userName: string, verificationUrl: string): string {
  const content = `
    <div class="header">
      <h1>Verify Your Email Address</h1>
    </div>

    <div class="content">
      <p>Hi ${userName},</p>

      <p>Thank you for creating an account! To complete your registration and access the platform, please verify your email address by clicking the button below:</p>

      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a></p>

      <div class="warning">
        <p><strong>⚠️ Security Note:</strong> This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      </div>
    </div>

    <div class="footer">
      <p>If you have any questions, please contact our support team.</p>
      <p>&copy; ${new Date().getFullYear()} Skyll Platform. All rights reserved.</p>
    </div>
  `;

  return baseEmailTemplate(content);
}

/**
 * Plain text version of email verification email
 * (fallback for email clients that don't support HTML)
 */
export function emailVerificationText(userName: string, verificationUrl: string): string {
  return `
Hi ${userName},

Thank you for creating an account! To complete your registration and access the platform, please verify your email address by visiting the following link:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

If you have any questions, please contact our support team.

© ${new Date().getFullYear()} Skyll Platform. All rights reserved.
  `.trim();
}

/**
 * Password reset email template
 * (for future use)
 */
export function passwordResetTemplate(userName: string, resetUrl: string): string {
  const content = `
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>

    <div class="content">
      <p>Hi ${userName},</p>

      <p>We received a request to reset your password. Click the button below to create a new password:</p>

      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a></p>

      <div class="warning">
        <p><strong>⚠️ Security Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
      </div>
    </div>

    <div class="footer">
      <p>If you have any questions, please contact our support team.</p>
      <p>&copy; ${new Date().getFullYear()} Skyll Platform. All rights reserved.</p>
    </div>
  `;

  return baseEmailTemplate(content);
}

/**
 * Plain text version of password reset email
 */
export function passwordResetText(userName: string, resetUrl: string): string {
  return `
Hi ${userName},

We received a request to reset your password. Visit the following link to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact support if you're concerned.

© ${new Date().getFullYear()} Skyll Platform. All rights reserved.
  `.trim();
}
