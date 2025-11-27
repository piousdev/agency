interface ActivityEmptyStateProps {
  readonly isFiltered: boolean;
}

export const ActivityEmptyState = ({ isFiltered }: ActivityEmptyStateProps) => {
  const message = isFiltered ? 'No activity matching filter' : 'No recent activity';

  return <div className="text-center py-8 text-muted-foreground text-sm">{message}</div>;
};
