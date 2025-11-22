'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CardActionButtonProps {
  href: string;
  label: string;
}

export function CardActionButton({ href, label }: CardActionButtonProps) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="w-full justify-center gap-2 h-9 text-sm font-medium bg-background/50 hover:bg-background border-border/50 hover:border-border"
    >
      <Link href={href}>
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}
