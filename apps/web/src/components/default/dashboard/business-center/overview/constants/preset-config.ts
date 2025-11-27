import type { LayoutPreset, PresetConfig } from '../types';

/**
 * Widget type to human-readable title mapping.
 */
export const WIDGET_TITLES: Readonly<Record<string, string>> = {
  'organization-health': 'Organization Health',
  'critical-alerts': 'Critical Alerts',
  'team-status': 'Team Status',
  'intake-pipeline': 'Intake Pipeline',
  'upcoming-deadlines': 'Upcoming Deadlines',
  'recent-activity': 'Recent Activity',
  'financial-snapshot': 'Financial Snapshot',
  'my-work-today': 'My Work Today',
  'current-sprint': 'Current Sprint',
  'risk-indicators': 'Risk Indicators',
  blockers: 'Blockers',
  'communication-hub': 'Communication Hub',
} as const;

/**
 * Layout preset configurations with labels.
 */
export const PRESET_CONFIGS: readonly PresetConfig[] = [
  { id: 'admin', label: 'Admin Layout' },
  { id: 'pm', label: 'Project Manager Layout' },
  { id: 'developer', label: 'Developer Layout' },
  { id: 'designer', label: 'Designer Layout' },
  { id: 'qa', label: 'QA Layout' },
  { id: 'client', label: 'Client Layout' },
] as const;

/**
 * Grouped presets for visual organization in menus.
 */
export const PRESET_GROUPS: readonly {
  readonly presets: readonly LayoutPreset[];
  readonly hasSeparatorAfter: boolean;
}[] = [
  { presets: ['admin'], hasSeparatorAfter: true },
  { presets: ['pm', 'developer', 'designer'], hasSeparatorAfter: true },
  { presets: ['qa', 'client'], hasSeparatorAfter: false },
] as const;

/**
 * Gets preset config by ID.
 */
export function getPresetConfig(preset: LayoutPreset): PresetConfig {
  const config = PRESET_CONFIGS.find((p) => p.id === preset);
  if (!config) {
    throw new Error(`Unknown preset: ${preset}`);
  }
  return config;
}
