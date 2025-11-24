/**
 * Intake Pipeline Load Testing Script
 *
 * Run with k6: k6 run apps/web/tests/load/intake-pipeline-load.js
 *
 * Install k6:
 * - macOS: brew install k6
 * - Linux: See https://k6.io/docs/getting-started/installation/
 *
 * Environment variables:
 * - BASE_URL: The base URL of the application (default: http://localhost:3000)
 * - API_URL: The API URL (default: http://localhost:3001)
 * - AUTH_TOKEN: Pre-authenticated session token for API calls
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const intakeListDuration = new Trend('intake_list_duration');
const intakeDetailDuration = new Trend('intake_detail_duration');
const intakeCreateDuration = new Trend('intake_create_duration');
const analyticsLoadDuration = new Trend('analytics_load_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 }, // Stay at 10 users
    { duration: '30s', target: 25 }, // Ramp up to 25 users
    { duration: '1m', target: 25 }, // Stay at 25 users
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '1m', target: 50 }, // Stay at 50 users
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'], // Error rate should be below 5%
    errors: ['rate<0.1'], // Custom error rate below 10%
    intake_list_duration: ['p(95)<3000'],
    intake_detail_duration: ['p(95)<2000'],
    intake_create_duration: ['p(95)<3000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = __ENV.API_URL || 'http://localhost:3001';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

// Headers for authenticated requests
const authHeaders = {
  'Content-Type': 'application/json',
  Cookie: AUTH_TOKEN ? `better-auth.session_token=${AUTH_TOKEN}` : '',
};

export default function () {
  group('Intake Pipeline - List View', () => {
    const start = Date.now();
    const response = http.get(`${API_URL}/api/requests?limit=20`, {
      headers: authHeaders,
    });

    const duration = Date.now() - start;
    intakeListDuration.add(duration);

    const success = check(response, {
      'list status is 200': (r) => r.status === 200,
      'list response time OK': (r) => r.timings.duration < 3000,
      'list has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success !== false;
        } catch {
          return false;
        }
      },
    });

    errorRate.add(!success);
    sleep(1);
  });

  group('Intake Pipeline - Stage Counts', () => {
    const response = http.get(`${API_URL}/api/requests/stage-counts`, {
      headers: authHeaders,
    });

    const success = check(response, {
      'stage counts status is 200': (r) => r.status === 200,
      'stage counts response time OK': (r) => r.timings.duration < 1000,
    });

    errorRate.add(!success);
    sleep(0.5);
  });

  group('Intake Pipeline - Analytics', () => {
    const start = Date.now();
    const response = http.get(`${API_URL}/api/requests/analytics`, {
      headers: authHeaders,
    });

    const duration = Date.now() - start;
    analyticsLoadDuration.add(duration);

    const success = check(response, {
      'analytics status is 200': (r) => r.status === 200,
      'analytics response time OK': (r) => r.timings.duration < 5000,
    });

    errorRate.add(!success);
    sleep(1);
  });

  group('Intake Pipeline - Filter by Stage', () => {
    const stages = ['in_treatment', 'on_hold', 'estimation', 'ready'];
    const randomStage = stages[Math.floor(Math.random() * stages.length)];

    const response = http.get(`${API_URL}/api/requests?stage=${randomStage}&limit=10`, {
      headers: authHeaders,
    });

    const success = check(response, {
      'filtered list status is 200': (r) => r.status === 200,
      'filtered list response time OK': (r) => r.timings.duration < 2000,
    });

    errorRate.add(!success);
    sleep(0.5);
  });

  group('Intake Pipeline - Search', () => {
    const response = http.get(`${API_URL}/api/requests?search=test&limit=10`, {
      headers: authHeaders,
    });

    const success = check(response, {
      'search status is 200': (r) => r.status === 200,
      'search response time OK': (r) => r.timings.duration < 2000,
    });

    errorRate.add(!success);
    sleep(0.5);
  });

  // Simulate occasional create operations (10% of virtual users)
  if (Math.random() < 0.1) {
    group('Intake Pipeline - Create Request', () => {
      const start = Date.now();
      const payload = JSON.stringify({
        title: `Load Test Request ${Date.now()}`,
        description: 'This is a load test request',
        type: 'feature_request',
        priority: 'medium',
      });

      const response = http.post(`${API_URL}/api/requests`, payload, {
        headers: authHeaders,
      });

      const duration = Date.now() - start;
      intakeCreateDuration.add(duration);

      const success = check(response, {
        'create status is 201 or 200': (r) => r.status === 201 || r.status === 200,
        'create response time OK': (r) => r.timings.duration < 3000,
      });

      errorRate.add(!success);
      sleep(2);
    });
  }

  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: '  ' }),
    'apps/web/tests/load/results.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options) {
  const indent = options?.indent || '';

  let summary = '\n==============================\n';
  summary += 'INTAKE PIPELINE LOAD TEST RESULTS\n';
  summary += '==============================\n\n';

  // Key metrics
  const metrics = data.metrics;

  summary += `${indent}HTTP Requests:\n`;
  summary += `${indent}  Total: ${metrics.http_reqs?.values?.count || 0}\n`;
  summary += `${indent}  Failed: ${(metrics.http_req_failed?.values?.rate * 100 || 0).toFixed(2)}%\n`;
  summary += `${indent}  Avg Duration: ${(metrics.http_req_duration?.values?.avg || 0).toFixed(2)}ms\n`;
  summary += `${indent}  P95 Duration: ${(metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n\n`;

  summary += `${indent}Custom Metrics:\n`;
  summary += `${indent}  Error Rate: ${(metrics.errors?.values?.rate * 100 || 0).toFixed(2)}%\n`;
  summary += `${indent}  Intake List P95: ${(metrics.intake_list_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `${indent}  Analytics P95: ${(metrics.analytics_load_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n\n`;

  // Thresholds
  summary += `${indent}Thresholds:\n`;
  for (const [name, threshold] of Object.entries(data.thresholds || {})) {
    const status = threshold.ok ? 'PASS' : 'FAIL';
    summary += `${indent}  ${name}: ${status}\n`;
  }

  return summary;
}
