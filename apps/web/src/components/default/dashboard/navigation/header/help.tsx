import Link from 'next/link';

import { IconHelpCircle } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

export default function Help() {
  return (
    <Link href="/dashboard/help" passHref>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Help"
        className="rounded-full cursor-pointer"
      >
        <IconHelpCircle className="size-[1.2rem] text-primary" />
      </Button>
    </Link>
  );
}
