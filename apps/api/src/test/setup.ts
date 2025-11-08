/**
 * Vitest test setup for API package
 * Runs before all tests to configure the testing environment
 */

import { beforeAll, vi } from 'vitest';
import dotenv from 'dotenv';

// Load environment variables for tests
beforeAll(() => {
  dotenv.config({ path: '.env.test' });

  // Set default test environment variables
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
  process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || 'test-secret-key';
  process.env.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || 'http://localhost:4000';

  // Mock SMTP credentials to prevent "Missing credentials" errors in tests
  process.env.SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
  process.env.SMTP_PORT = process.env.SMTP_PORT || '587';
  process.env.SMTP_USER = process.env.SMTP_USER || 'test@example.com';
  process.env.SMTP_PASS = process.env.SMTP_PASS || 'test-password';
  process.env.SMTP_FROM = process.env.SMTP_FROM || 'noreply@example.com';
});

// Mock nodemailer to prevent actual email sending in tests
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({
        messageId: '<test-message-id@example.com>',
        accepted: ['test@example.com'],
        rejected: [],
        response: '250 Message accepted',
      }),
      verify: vi.fn().mockResolvedValue(true),
    })),
  },
}));
