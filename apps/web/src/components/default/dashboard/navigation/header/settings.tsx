import { Settings as Cog } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Settings() {
  return (
    <Link href="/dashboard/settings" passHref>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Settings"
        className="rounded-full cursor-pointer"
      >
        <Cog className="size-[1.2rem] text-primary" />
      </Button>
    </Link>
  );
}
