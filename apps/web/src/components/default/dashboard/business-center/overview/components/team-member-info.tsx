interface MemberInfoProps {
  readonly name: string;
  readonly role: string;
}

export const MemberInfo = ({ name, role }: MemberInfoProps) => {
  return (
    <div className="flex-1 min-w-0" data-testid="member-info-container">
      <p className="text-sm font-medium truncate" data-testid="member-info-name">
        {name}
      </p>
      <p className="text-xs text-muted-foreground truncate" data-testid="member-info-role">
        {role}
      </p>
    </div>
  );
};

MemberInfo.displayName = 'MemberInfo';
