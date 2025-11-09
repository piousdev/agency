import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../../../index.js';
import { db } from '../../../db';

// Mock database
vi.mock('../../../db/index.js', () => ({
  db: {
    execute: vi.fn(),
  },
}));

describe('Health Check Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return healthy status when database is accessible', async () => {
      // Mock successful database connection
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ health_check: 1 }],
        fields: [],
        command: 'SELECT',
        rowCount: 1,
        rowAsArray: false,
      });

      const res = await app.request('/health');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('uptime');
      expect(data.checks.database.status).toBe('pass');
    });

    it('should return unhealthy status when database is not accessible', async () => {
      // Mock database connection failure
      vi.mocked(db.execute).mockRejectedValueOnce(new Error('Connection refused'));

      const res = await app.request('/health');
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data.checks.database.status).toBe('fail');
      expect(data.checks.database.message).toBe('Connection refused');
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status when database is accessible', async () => {
      // Mock successful database connection
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ result: 1 }],
        fields: [],
        command: 'SELECT',
        rowCount: 1,
        rowAsArray: false,
      });

      const res = await app.request('/health/ready');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe('ready');
      expect(data).toHaveProperty('timestamp');
    });

    it('should return not ready status when database is not accessible', async () => {
      // Mock database connection failure
      vi.mocked(db.execute).mockRejectedValueOnce(new Error('Connection refused'));

      const res = await app.request('/health/ready');
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.status).toBe('not ready');
      expect(data.message).toBe('Database not accessible');
    });
  });

  describe('GET /health/live', () => {
    it('should always return alive status', async () => {
      const res = await app.request('/health/live');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe('alive');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('uptime');
    });
  });
});
