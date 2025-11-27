import { memo, type RefObject, type KeyboardEvent } from 'react';

import { IconSend, IconX } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuickReplyInputProps {
  readonly inputRef: RefObject<HTMLInputElement>;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSend: () => void;
  readonly onCancel: () => void;
  readonly isPending: boolean;
}

export const QuickReplyInput = memo(function QuickReplyInput({
  inputRef,
  value,
  onChange,
  onSend,
  onCancel,
  isPending,
}: QuickReplyInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const canSend = value.trim().length > 0 && !isPending;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Intentional click stop propagation for input container
    <div
      className="flex items-center gap-2 mt-2"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        // Allow keyboard events to propagate to the input
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
        }
      }}
      role="group"
    >
      <Input
        ref={inputRef}
        type="text"
        placeholder="Type your reply..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-7 text-xs flex-1"
        disabled={isPending}
      />
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSend} disabled={!canSend}>
        <IconSend className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Send reply</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onCancel}
        disabled={isPending}
      >
        <IconX className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Cancel</span>
      </Button>
    </div>
  );
});
