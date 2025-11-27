/**
 * Email Service using NodeMailer
 *
 * Provides email sending functionality for authentication emails
 * (verification, password reset, etc.)
 *
 * Configuration:
 * - Uses SMTP configuration from environment variables
 * - Supports Gmail, SendGrid, or custom SMTP servers
 *
 * Environment Variables Required:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port (usually 587 for TLS)
 * - SMTP_USER: SMTP username/email
 * - SMTP_PASS: SMTP password/API key
 * - SMTP_FROM: Default "from" email address
 */

import nodemailer from 'nodemailer';

import type { Transporter } from 'nodemailer';

/**
 * Email sending options
 */
export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * SMTP Configuration from environment variables
 */
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT ?? '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
  },
};

/**
 * Default "from" address for emails
 */
const FROM_EMAIL = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@example.com';

/**
 * Create and configure NodeMailer transporter
 */
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  // Check if SMTP is configured
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    console.warn(
      '⚠️  SMTP not configured. Email sending will fail. Set SMTP_* environment variables.'
    );

    // Return a mock transporter for development
    return {
      sendMail: (mailOptions: { to?: string; subject?: string }) => {
        console.log('📧 [DEV MODE] Simulated email sent:');
        console.log(`   To: ${mailOptions.to ?? 'unknown'}`);
        console.log(`   Subject: ${mailOptions.subject ?? 'no subject'}`);
        return Promise.resolve({ messageId: 'dev-mock-id-' + String(Date.now()) });
      },
      verify: () => Promise.resolve(true),
    } as unknown as Transporter;
  }

  transporter = nodemailer.createTransport(SMTP_CONFIG);

  return transporter;
}

/**
 * Send an email using the configured SMTP server
 *
 * @param options - Email options (to, subject, text, html)
 * @returns Promise that resolves when email is sent
 *
 * @example
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Verify your email',
 *   html: '<p>Click <a href="...">here</a> to verify</p>'
 * });
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transport = getTransporter();

  try {
    const info: { messageId?: string } = (await transport.sendMail({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })) as { messageId?: string };

    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify SMTP connection (useful for debugging)
 */
export async function verifyEmailConnection(): Promise<boolean> {
  const transport = getTransporter();

  try {
    await transport.verify();
    console.log('✅ SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}
