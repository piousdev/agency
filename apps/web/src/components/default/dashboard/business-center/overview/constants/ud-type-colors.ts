import type { DeadlineType } from '../types';

export const DEADLINE_TYPE_COLORS: Record<DeadlineType, string> = {
  project: 'bg-accent/10 text-accent-foreground border-accent/20',
  milestone: 'bg-primary/10 text-primary border-primary/20',
  ticket: 'bg-success/10 text-success border-success/20',
  deliverable: 'bg-warning/10 text-warning border-warning/20',
};
