import type { RiskSummary } from '../types';

export const MOCK_RISK_SUMMARY: Readonly<RiskSummary> = {
  total: 3,
  critical: 0,
  high: 1,
  medium: 1,
  low: 1,
  risks: [
    {
      id: 'risk-1',
      category: 'schedule',
      projectId: 'proj-1',
      projectName: 'Acme Website Redesign',
      severity: 'high',
      description: 'Sprint velocity below target for 2 consecutive sprints',
      impact: 'May miss Q1 deadline',
      mitigation: 'Adding additional developer resource',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'risk-2',
      category: 'budget',
      projectId: 'proj-2',
      projectName: 'TechCorp Mobile App',
      severity: 'medium',
      description: 'Budget utilization at 85% with 30% work remaining',
      impact: 'Potential budget overrun of 15-20%',
      mitigation: 'Scope review scheduled with client',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'risk-3',
      category: 'resource',
      projectId: 'proj-1',
      projectName: 'Acme Website Redesign',
      severity: 'low',
      description: 'Key developer on PTO next week',
      impact: 'Minor delay in API integration',
      createdAt: new Date().toISOString(),
    },
  ],
} as const;
