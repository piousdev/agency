/**
 * Request Schemas Validation Tests
 * Tests for intake pipeline request schemas
 */

import { describe, it, expect } from 'vitest';
import {
  requestTypeSchema,
  requestStageSchema,
  confidenceSchema,
  prioritySchema,
  createRequestSchema,
  updateRequestSchema,
  estimateRequestSchema,
  convertRequestSchema,
  holdRequestSchema,
  getRoutingRecommendation,
  REQUEST_TYPE_LABELS,
  REQUEST_STAGE_LABELS,
  CONFIDENCE_LABELS,
  PRIORITY_LABELS,
  STAGE_THRESHOLDS,
  STORY_POINT_OPTIONS,
  REQUEST_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  CONFIDENCE_OPTIONS,
} from '../request';

describe('Request Schema Enums', () => {
  describe('requestTypeSchema', () => {
    it('should accept all valid request types', () => {
      const validTypes = ['bug', 'feature', 'enhancement', 'change_request', 'support', 'other'];
      validTypes.forEach((type) => {
        const result = requestTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid request type', () => {
      const result = requestTypeSchema.safeParse('invalid_type');
      expect(result.success).toBe(false);
    });
  });

  describe('requestStageSchema', () => {
    it('should accept all valid stages', () => {
      const validStages = ['in_treatment', 'on_hold', 'estimation', 'ready'];
      validStages.forEach((stage) => {
        const result = requestStageSchema.safeParse(stage);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid stage', () => {
      const result = requestStageSchema.safeParse('invalid_stage');
      expect(result.success).toBe(false);
    });
  });

  describe('confidenceSchema', () => {
    it('should accept all valid confidence levels', () => {
      const validLevels = ['low', 'medium', 'high'];
      validLevels.forEach((level) => {
        const result = confidenceSchema.safeParse(level);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid confidence level', () => {
      const result = confidenceSchema.safeParse('very_high');
      expect(result.success).toBe(false);
    });
  });

  describe('prioritySchema', () => {
    it('should accept all valid priorities', () => {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      validPriorities.forEach((priority) => {
        const result = prioritySchema.safeParse(priority);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid priority', () => {
      const result = prioritySchema.safeParse('urgent');
      expect(result.success).toBe(false);
    });
  });
});

describe('createRequestSchema', () => {
  it('should validate a minimal valid request', () => {
    const validRequest = {
      title: 'Test Request',
      type: 'feature',
      priority: 'medium',
      description: 'A test description',
    };

    const result = createRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate a fully populated request', () => {
    const fullRequest = {
      title: 'Full Test Request',
      type: 'bug',
      priority: 'critical',
      description: 'Detailed description',
      businessJustification: 'Business impact explanation',
      stepsToReproduce: '1. Step one\n2. Step two',
      clientId: 'client-123',
      relatedProjectId: 'project-456',
      dependencies: 'Depends on API update',
      desiredDeliveryDate: '2024-12-31',
      additionalNotes: 'Extra notes here',
      tags: ['urgent', 'frontend'],
    };

    const result = createRequestSchema.safeParse(fullRequest);
    expect(result.success).toBe(true);
  });

  it('should require title', () => {
    const result = createRequestSchema.safeParse({
      type: 'feature',
      priority: 'medium',
      description: 'A description',
    });
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toBeDefined();
    }
  });

  it('should require type', () => {
    const result = createRequestSchema.safeParse({
      title: 'Test',
      priority: 'medium',
      description: 'A description',
    });
    expect(result.success).toBe(false);
  });

  it('should require priority', () => {
    const result = createRequestSchema.safeParse({
      title: 'Test',
      type: 'feature',
      description: 'A description',
    });
    expect(result.success).toBe(false);
  });

  it('should require description', () => {
    const result = createRequestSchema.safeParse({
      title: 'Test',
      type: 'feature',
      priority: 'medium',
    });
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.description).toBeDefined();
    }
  });

  it('should reject empty title', () => {
    const result = createRequestSchema.safeParse({
      title: '',
      type: 'feature',
      priority: 'medium',
      description: 'A description',
    });
    expect(result.success).toBe(false);
  });

  it('should reject title longer than 500 characters', () => {
    const result = createRequestSchema.safeParse({
      title: 'a'.repeat(501),
      type: 'feature',
      priority: 'medium',
      description: 'A description',
    });
    expect(result.success).toBe(false);
  });

  it('should accept title at max length (500 characters)', () => {
    const result = createRequestSchema.safeParse({
      title: 'a'.repeat(500),
      type: 'feature',
      priority: 'medium',
      description: 'A description',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty description', () => {
    const result = createRequestSchema.safeParse({
      title: 'Test',
      type: 'feature',
      priority: 'medium',
      description: '',
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional fields as undefined', () => {
    const result = createRequestSchema.safeParse({
      title: 'Test',
      type: 'feature',
      priority: 'medium',
      description: 'Description',
      businessJustification: undefined,
      clientId: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('should accept tags array', () => {
    const result = createRequestSchema.safeParse({
      title: 'Test',
      type: 'feature',
      priority: 'medium',
      description: 'Description',
      tags: ['tag1', 'tag2', 'tag3'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(['tag1', 'tag2', 'tag3']);
    }
  });

  it('should accept all valid type values', () => {
    const types = ['bug', 'feature', 'enhancement', 'change_request', 'support', 'other'];
    types.forEach((type) => {
      const result = createRequestSchema.safeParse({
        title: 'Test',
        type,
        priority: 'medium',
        description: 'Description',
      });
      expect(result.success).toBe(true);
    });
  });

  it('should accept all valid priority values', () => {
    const priorities = ['low', 'medium', 'high', 'critical'];
    priorities.forEach((priority) => {
      const result = createRequestSchema.safeParse({
        title: 'Test',
        type: 'feature',
        priority,
        description: 'Description',
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('updateRequestSchema', () => {
  it('should allow partial updates', () => {
    const result = updateRequestSchema.safeParse({
      title: 'Updated Title',
    });
    expect(result.success).toBe(true);
  });

  it('should allow empty object', () => {
    const result = updateRequestSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should still validate provided fields', () => {
    // Title must not be empty if provided
    const result = updateRequestSchema.safeParse({
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('should validate title max length', () => {
    const result = updateRequestSchema.safeParse({
      title: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('should accept updating multiple fields', () => {
    const result = updateRequestSchema.safeParse({
      title: 'New Title',
      priority: 'high',
      tags: ['updated'],
    });
    expect(result.success).toBe(true);
  });
});

describe('estimateRequestSchema', () => {
  it('should validate a valid estimation', () => {
    const validEstimation = {
      storyPoints: 5,
      confidence: 'medium',
    };

    const result = estimateRequestSchema.safeParse(validEstimation);
    expect(result.success).toBe(true);
  });

  it('should accept estimation with notes', () => {
    const result = estimateRequestSchema.safeParse({
      storyPoints: 8,
      confidence: 'high',
      estimationNotes: 'Based on similar previous work',
    });
    expect(result.success).toBe(true);
  });

  it('should require storyPoints', () => {
    const result = estimateRequestSchema.safeParse({
      confidence: 'medium',
    });
    expect(result.success).toBe(false);
  });

  it('should require confidence', () => {
    const result = estimateRequestSchema.safeParse({
      storyPoints: 5,
    });
    expect(result.success).toBe(false);
  });

  it('should reject storyPoints less than 1', () => {
    const result = estimateRequestSchema.safeParse({
      storyPoints: 0,
      confidence: 'medium',
    });
    expect(result.success).toBe(false);
  });

  it('should reject storyPoints greater than 100', () => {
    const result = estimateRequestSchema.safeParse({
      storyPoints: 101,
      confidence: 'medium',
    });
    expect(result.success).toBe(false);
  });

  it('should accept minimum storyPoints (1)', () => {
    const result = estimateRequestSchema.safeParse({
      storyPoints: 1,
      confidence: 'low',
    });
    expect(result.success).toBe(true);
  });

  it('should accept maximum storyPoints (100)', () => {
    const result = estimateRequestSchema.safeParse({
      storyPoints: 100,
      confidence: 'high',
    });
    expect(result.success).toBe(true);
  });

  it('should accept all Fibonacci story points', () => {
    const fibonacciPoints = [1, 2, 3, 5, 8, 13, 21];
    fibonacciPoints.forEach((points) => {
      const result = estimateRequestSchema.safeParse({
        storyPoints: points,
        confidence: 'medium',
      });
      expect(result.success).toBe(true);
    });
  });

  it('should accept all confidence levels', () => {
    const levels = ['low', 'medium', 'high'];
    levels.forEach((confidence) => {
      const result = estimateRequestSchema.safeParse({
        storyPoints: 5,
        confidence,
      });
      expect(result.success).toBe(true);
    });
  });

  it('should reject non-integer storyPoints', () => {
    const result = estimateRequestSchema.safeParse({
      storyPoints: 5.5,
      confidence: 'medium',
    });
    expect(result.success).toBe(false);
  });
});

describe('convertRequestSchema', () => {
  it('should validate conversion to project', () => {
    const result = convertRequestSchema.safeParse({
      destinationType: 'project',
    });
    expect(result.success).toBe(true);
  });

  it('should validate conversion to ticket with project', () => {
    const result = convertRequestSchema.safeParse({
      destinationType: 'ticket',
      projectId: 'project-123',
    });
    expect(result.success).toBe(true);
  });

  it('should require destinationType', () => {
    const result = convertRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should accept overrideRouting flag', () => {
    const result = convertRequestSchema.safeParse({
      destinationType: 'project',
      overrideRouting: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overrideRouting).toBe(true);
    }
  });

  it('should default overrideRouting to false', () => {
    const result = convertRequestSchema.safeParse({
      destinationType: 'project',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overrideRouting).toBe(false);
    }
  });

  it('should reject invalid destinationType', () => {
    const result = convertRequestSchema.safeParse({
      destinationType: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should accept projectId as optional', () => {
    const result = convertRequestSchema.safeParse({
      destinationType: 'project',
      projectId: undefined,
    });
    expect(result.success).toBe(true);
  });
});

describe('holdRequestSchema', () => {
  it('should validate a valid hold reason', () => {
    const result = holdRequestSchema.safeParse({
      reason: 'Waiting for client feedback',
    });
    expect(result.success).toBe(true);
  });

  it('should require reason', () => {
    const result = holdRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty reason', () => {
    const result = holdRequestSchema.safeParse({
      reason: '',
    });
    expect(result.success).toBe(false);
  });

  it('should accept long reasons', () => {
    const result = holdRequestSchema.safeParse({
      reason: 'This is a detailed explanation of why the request is on hold. '.repeat(10),
    });
    expect(result.success).toBe(true);
  });
});

describe('getRoutingRecommendation', () => {
  describe('change_request type', () => {
    it('should always route to ticket regardless of points', () => {
      expect(getRoutingRecommendation(1, 'change_request')).toBe('ticket');
      expect(getRoutingRecommendation(5, 'change_request')).toBe('ticket');
      expect(getRoutingRecommendation(13, 'change_request')).toBe('ticket');
      expect(getRoutingRecommendation(100, 'change_request')).toBe('ticket');
    });
  });

  describe('points-based routing', () => {
    it('should route to ticket for null points', () => {
      expect(getRoutingRecommendation(null, 'feature')).toBe('ticket');
    });

    it('should route to ticket for undefined points', () => {
      expect(getRoutingRecommendation(undefined, 'feature')).toBe('ticket');
    });

    it('should route to ticket for 0 points', () => {
      expect(getRoutingRecommendation(0, 'feature')).toBe('ticket');
    });

    it('should route to ticket for 1-8 points', () => {
      expect(getRoutingRecommendation(1, 'feature')).toBe('ticket');
      expect(getRoutingRecommendation(5, 'bug')).toBe('ticket');
      expect(getRoutingRecommendation(8, 'enhancement')).toBe('ticket');
    });

    it('should route to project for 9+ points', () => {
      expect(getRoutingRecommendation(9, 'feature')).toBe('project');
      expect(getRoutingRecommendation(13, 'bug')).toBe('project');
      expect(getRoutingRecommendation(21, 'enhancement')).toBe('project');
    });
  });

  describe('type coverage', () => {
    it('should apply points-based routing for all non-change_request types', () => {
      const types: Array<'bug' | 'feature' | 'enhancement' | 'support' | 'other'> = [
        'bug',
        'feature',
        'enhancement',
        'support',
        'other',
      ];

      types.forEach((type) => {
        // Low points -> ticket
        expect(getRoutingRecommendation(5, type)).toBe('ticket');
        // High points -> project
        expect(getRoutingRecommendation(13, type)).toBe('project');
      });
    });
  });
});

describe('Label Constants', () => {
  it('should have labels for all request types', () => {
    const types = ['bug', 'feature', 'enhancement', 'change_request', 'support', 'other'] as const;
    types.forEach((type) => {
      expect(REQUEST_TYPE_LABELS[type]).toBeDefined();
      expect(typeof REQUEST_TYPE_LABELS[type]).toBe('string');
    });
  });

  it('should have labels for all stages', () => {
    const stages = ['in_treatment', 'on_hold', 'estimation', 'ready'] as const;
    stages.forEach((stage) => {
      expect(REQUEST_STAGE_LABELS[stage]).toBeDefined();
      expect(typeof REQUEST_STAGE_LABELS[stage]).toBe('string');
    });
  });

  it('should have labels for all confidence levels', () => {
    const levels = ['low', 'medium', 'high'] as const;
    levels.forEach((level) => {
      expect(CONFIDENCE_LABELS[level]).toBeDefined();
      expect(typeof CONFIDENCE_LABELS[level]).toBe('string');
    });
  });

  it('should have labels for all priorities', () => {
    const priorities = ['low', 'medium', 'high', 'critical'] as const;
    priorities.forEach((priority) => {
      expect(PRIORITY_LABELS[priority]).toBeDefined();
      expect(typeof PRIORITY_LABELS[priority]).toBe('string');
    });
  });
});

describe('Stage Thresholds', () => {
  it('should have thresholds for all stages', () => {
    const stages = ['in_treatment', 'on_hold', 'estimation', 'ready'] as const;
    stages.forEach((stage) => {
      expect(STAGE_THRESHOLDS[stage]).toBeDefined();
      expect(STAGE_THRESHOLDS[stage].warning).toBeDefined();
      expect(STAGE_THRESHOLDS[stage].critical).toBeDefined();
    });
  });

  it('should have critical threshold greater than warning', () => {
    const stages = ['in_treatment', 'on_hold', 'estimation', 'ready'] as const;
    stages.forEach((stage) => {
      expect(STAGE_THRESHOLDS[stage].critical).toBeGreaterThan(STAGE_THRESHOLDS[stage].warning);
    });
  });

  it('should have reasonable threshold values in hours', () => {
    // In treatment: 24h warning, 48h critical
    expect(STAGE_THRESHOLDS.in_treatment.warning).toBe(24);
    expect(STAGE_THRESHOLDS.in_treatment.critical).toBe(48);

    // Ready should have shortest thresholds
    expect(STAGE_THRESHOLDS.ready.warning).toBeLessThan(STAGE_THRESHOLDS.in_treatment.warning);
  });
});

describe('Options Constants', () => {
  describe('STORY_POINT_OPTIONS', () => {
    it('should be Fibonacci sequence', () => {
      expect(STORY_POINT_OPTIONS).toEqual([1, 2, 3, 5, 8, 13, 21]);
    });
  });

  describe('REQUEST_TYPE_OPTIONS', () => {
    it('should have value and label for each option', () => {
      REQUEST_TYPE_OPTIONS.forEach((option) => {
        expect(option.value).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });

    it('should match REQUEST_TYPE_LABELS', () => {
      REQUEST_TYPE_OPTIONS.forEach((option) => {
        expect(REQUEST_TYPE_LABELS[option.value]).toBe(option.label);
      });
    });
  });

  describe('PRIORITY_OPTIONS', () => {
    it('should have value and label for each option', () => {
      PRIORITY_OPTIONS.forEach((option) => {
        expect(option.value).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });

    it('should match PRIORITY_LABELS', () => {
      PRIORITY_OPTIONS.forEach((option) => {
        expect(PRIORITY_LABELS[option.value]).toBe(option.label);
      });
    });
  });

  describe('CONFIDENCE_OPTIONS', () => {
    it('should have value and label for each option', () => {
      CONFIDENCE_OPTIONS.forEach((option) => {
        expect(option.value).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });

    it('should match CONFIDENCE_LABELS', () => {
      CONFIDENCE_OPTIONS.forEach((option) => {
        expect(CONFIDENCE_LABELS[option.value]).toBe(option.label);
      });
    });
  });
});
