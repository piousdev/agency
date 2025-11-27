import Link from 'next/link';

import { Item, ItemContent, ItemTitle, ItemActions } from '@/components/ui/item';
import { cn } from '@/lib/utils';

interface ClassNames {
  readonly content?: string;
  readonly title?: string;
  readonly actions?: string;
  readonly icon?: string;
}

interface CardFooterProps {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly className?: string;
  readonly classNames?: ClassNames;
}

export const CardFooter = ({ href, label, icon: Icon, className, classNames }: CardFooterProps) => {
  return (
    <Item asChild className={className} aria-label={label} data-testid="card-footer-item-container">
      <Link href={href}>
        <ItemContent
          className={classNames?.content}
          aria-label={label}
          data-testid="card-footer-content-container"
        >
          <ItemTitle
            className={cn('text-sm', classNames?.title)}
            aria-label={label}
            data-testid="card-footer-content-title"
          >
            <span
              id="card-footer-content-title-text"
              aria-label={label}
              data-testid="card-footer-content-title-text"
            >
              {label}
            </span>
          </ItemTitle>
        </ItemContent>
        <ItemActions
          className={classNames?.actions}
          aria-label={label}
          data-testid="card-footer-content-actions"
        >
          <Icon
            className={classNames?.icon}
            aria-label={label}
            data-testid="card-footer-content-icon"
          />
        </ItemActions>
      </Link>
    </Item>
  );
};

CardFooter.displayName = 'CardFooter';
