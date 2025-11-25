import { QuickActions } from '@/components/dashboard/business-center/overview/shared';
import EditModeToggle from '@/components/dashboard/business-center/overview/widgets/edit-mode-toggle';

interface HeaderProps {
  greeting: string;
  userName?: string;
  userRole: string;
}

export function Header({ greeting, userName, userRole }: HeaderProps) {
  const displayName = userName?.split(' ')[0];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}
          {displayName ? `, ${displayName}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your overview for today, {new Date().toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <QuickActions className="corner-squircle rounded" />
        <EditModeToggle userRole={userRole} />
      </div>
    </div>
  );
}
