import { HelpCircle } from 'lucide-react';
import Link from 'next/link';
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
        <HelpCircle className="size-[1.2rem] text-primary" />
      </Button>
    </Link>
  );
}
