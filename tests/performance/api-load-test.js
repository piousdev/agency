import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Load Testing Script for Skyll Platform API
 *
 * Run with:
 * k6 run tests/performance/api-load-test.js
 *
 * Or with specific options:
 * k6 run --vus 10 --duration 30s tests/performance/api-load-test.js
 */

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 }, // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should complete below 500ms
    http_req_failed: ['rate<0.01'], // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000';

export default function () {
  // Test health check endpoint
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // Test root API endpoint
  const rootRes = http.get(`${BASE_URL}/`);
  check(rootRes, {
    'root endpoint status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  return `
  ========== k6 Load Test Summary ==========

  Total Requests: ${data.metrics.http_reqs.values.count}
  Failed Requests: ${data.metrics.http_req_failed.values.passes} (${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%)

  Response Times:
    - Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
    - Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms
    - Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms
    - p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms

  VUs: ${data.metrics.vus.values.value}
  Duration: ${(data.state.testRunDurationMs / 1000).toFixed(2)}s
  ==========================================
  `;
}
