import { TooltipContent } from '@/components/ui/tooltip';

type StatusTooltipProps = Readonly<{
  label: string;
  description: string;
}>;

export function StatusTooltip({ label, description }: StatusTooltipProps) {
  return (
    <TooltipContent side="bottom">
      <p className="font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </TooltipContent>
  );
}
