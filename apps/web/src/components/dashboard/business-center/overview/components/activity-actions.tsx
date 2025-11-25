import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item';

interface ActivityActionsProps {
  readonly href?: string;
  readonly label?: string;
}

export const ActivityActions = ({
  href = '/dashboard/collaboration/feed',
  label = 'View all activity',
}: ActivityActionsProps) => {
  return (
    <Item
      asChild
      className="hover:rounded-full hover:corner-squircle focus:rounded-full focus:corner-squircle active:rounded-full active:corner-squircle transition-all"
    >
      <Link href={href}>
        <ItemContent>
          <ItemTitle>{label}</ItemTitle>
        </ItemContent>
        <ItemActions>
          <IconArrowRight className="size-4" aria-hidden="true" />
        </ItemActions>
      </Link>
    </Item>
  );
};
