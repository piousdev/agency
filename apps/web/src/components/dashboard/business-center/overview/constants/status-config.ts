import type { TeamMemberStatus } from '@/components/dashboard/business-center/overview/types';

export const STATUS_COLORS: Readonly<Record<TeamMemberStatus, string>> = {
  available: 'bg-success',
  busy: 'bg-primary',
  at_capacity: 'bg-warning',
  overloaded: 'bg-destructive',
  away: 'bg-muted-foreground',
} as const;

export const STATUS_LABELS: Readonly<Record<TeamMemberStatus, string>> = {
  available: 'Available',
  busy: 'Busy',
  at_capacity: 'At Capacity',
  overloaded: 'Overloaded',
  away: 'Away',
} as const;

export const STATUS_BADGE_VARIANTS: Readonly<Partial<Record<TeamMemberStatus, string>>> = {
  overloaded: 'border-destructive/20 bg-destructive/10 text-destructive',
} as const;
