

interface TaskEmptyStateProps {
  readonly isFiltered: boolean;
}

export const TaskEmptyState = ({ isFiltered }: TaskEmptyStateProps) => {
  const message = isFiltered ? 'No tasks match your filter' : 'No tasks assigned';

  return <div className="text-center py-8 text-muted-foreground text-sm">{message}</div>;
};
