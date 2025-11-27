'use client';

import { useState, useRef, type ReactNode } from 'react';

import { IconArrowRight, IconCheck } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon?: ReactNode;
    label: string;
    color?: 'primary' | 'destructive' | 'warning';
  };
  rightAction?: {
    icon?: ReactNode;
    label: string;
    color?: 'primary' | 'destructive' | 'warning';
  };
  disabled?: boolean;
  className?: string;
}

const SWIPE_THRESHOLD = 80; // Minimum swipe distance to trigger action
const MAX_SWIPE = 120; // Maximum visual swipe distance

const DEFAULT_LEFT_ACTION = {
  label: 'Quick Action',
  icon: <IconArrowRight className="h-5 w-5" />,
  color: 'primary' as const,
};

const DEFAULT_RIGHT_ACTION = {
  label: 'Select',
  icon: <IconCheck className="h-5 w-5" />,
  color: 'primary' as const,
};

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = DEFAULT_LEFT_ACTION,
  rightAction = DEFAULT_RIGHT_ACTION,
  disabled = false,
  className,
}: SwipeableCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const getActionColor = (color?: 'primary' | 'destructive' | 'warning') => {
    switch (color) {
      case 'destructive':
        return 'bg-destructive text-destructive-foreground';
      case 'warning':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || !e.touches[0]) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isDragging || !e.touches[0]) return;

    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;

    // Limit the swipe distance
    const clampedDiff = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff));

    // Only allow swipe in directions that have actions
    if (diff < 0 && !onSwipeLeft) return;
    if (diff > 0 && !onSwipeRight) return;

    setTranslateX(clampedDiff);
  };

  const handleTouchEnd = () => {
    if (disabled || !isDragging) return;

    const diff = currentXRef.current - startXRef.current;

    // Check if swipe threshold was met
    if (diff < -SWIPE_THRESHOLD && onSwipeLeft) {
      onSwipeLeft();
    } else if (diff > SWIPE_THRESHOLD && onSwipeRight) {
      onSwipeRight();
    }

    // Reset position
    setTranslateX(0);
    setIsDragging(false);
  };

  const handleTouchCancel = () => {
    setTranslateX(0);
    setIsDragging(false);
  };

  const showLeftIndicator = translateX < -20 && onSwipeLeft;
  const showRightIndicator = translateX > 20 && onSwipeRight;
  const leftProgress = Math.min(1, Math.abs(translateX) / SWIPE_THRESHOLD);
  const rightProgress = Math.min(1, translateX / SWIPE_THRESHOLD);

  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      {/* Left action indicator (revealed when swiping left) */}
      {onSwipeLeft && (
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex items-center justify-end px-4 transition-opacity',
            getActionColor(leftAction.color),
            showLeftIndicator ? 'opacity-100' : 'opacity-0'
          )}
          style={{ width: MAX_SWIPE }}
        >
          <div
            className="flex flex-col items-center gap-1"
            style={{
              opacity: leftProgress,
              transform: `scale(${String(0.8 + leftProgress * 0.2)})`,
            }}
          >
            {leftAction.icon}
            <span className="text-xs font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right action indicator (revealed when swiping right) */}
      {onSwipeRight && (
        <div
          className={cn(
            'absolute inset-y-0 left-0 flex items-center justify-start px-4 transition-opacity',
            getActionColor(rightAction.color),
            showRightIndicator ? 'opacity-100' : 'opacity-0'
          )}
          style={{ width: MAX_SWIPE }}
        >
          <div
            className="flex flex-col items-center gap-1"
            style={{
              opacity: rightProgress,
              transform: `scale(${String(0.8 + rightProgress * 0.2)})`,
            }}
          >
            {rightAction.icon}
            <span className="text-xs font-medium">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className={cn(
          'relative bg-background transition-transform',
          isDragging ? 'transition-none' : 'duration-200'
        )}
        style={{ transform: `translateX(${String(translateX)}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {children}
      </div>
    </div>
  );
}
