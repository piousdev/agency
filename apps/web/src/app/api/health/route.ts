/**
 * Health Check API Route
 *
 * Provides application health status for monitoring and deployment validation.
 * Used by load balancers, monitoring tools, and deployment pipelines.
 */

import { NextResponse } from 'next/server';

import packageJson from '../../../../package.json';

interface HealthResponse {
  status: 'healthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
}

/**
 * GET /api/health
 *
 * Returns basic health status for the Next.js application.
 * No database check needed as this is a stateless Next.js frontend.
 */
export async function GET() {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };

  return NextResponse.json(response, { status: 200 });
}
