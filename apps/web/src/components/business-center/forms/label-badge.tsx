'use client';

import { IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface LabelBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Determine if a color is light (for text contrast)
 */
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function LabelBadge({ name, color, onRemove, className, size = 'sm' }: LabelBadgeProps) {
  const textColor = isLightColor(color) ? '#000' : '#fff';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
      style={{
        backgroundColor: color,
        color: textColor,
      }}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/20 transition-colors"
        >
          <IconX className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        </button>
      )}
    </span>
  );
}
