export function isOverdue(dueAt: string): boolean {
  return new Date(dueAt) < new Date();
}

export function formatDueDate(dueAt: string): string {
  const date = new Date(dueAt);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;

  return date.toLocaleDateString('en-BE', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function getDiffDays(dueAt: string): number {
  const date = new Date(dueAt);
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
