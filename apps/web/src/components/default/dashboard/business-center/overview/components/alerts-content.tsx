import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';

interface AlertContentProps {
  readonly title: string;
  readonly message: string;
  readonly iconClass: string;
  readonly Icon: React.ComponentType<{ className?: string }>;
}

export const AlertsContent = ({ title, message, iconClass, Icon }: AlertContentProps) => {
  return (
    <Item
      className="flex items-start gap-2 flex-1 min-w-0 p-0"
      data-testid="alert-item-content"
      aria-label="Alert content"
    >
      <ItemMedia data-testid="alert-item-content-icon" aria-label="Alert icon">
        <Icon
          className={cn('size-4 mt-0.5 shrink-0', iconClass)}
          aria-hidden="true"
          data-testid="alert-item-content-icon"
        />
      </ItemMedia>
      <ItemContent data-testid="alert-item-content-text" aria-label="Alert text content">
        <ItemTitle data-testid="alert-item-content-title" aria-label="Alert title">
          {title}
        </ItemTitle>
        <ItemDescription data-testid="alert-item-content-message" aria-label="Alert message">
          {message}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};
