import type { ComponentType } from 'react';

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

export type StatusConfig = Readonly<{
  icon: ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
  description: string;
}>;

export type ConnectionStatusProps = Readonly<{
  className?: string;
  showLabel?: boolean;
}>;

export type ConnectionDotProps = Readonly<{
  className?: string;
}>;

export type StatusIconProps = Readonly<{
  icon: ComponentType<{ className?: string }>;
  color: string;
  isAnimating?: boolean;
}>;

export type StatusLabelProps = Readonly<{
  label: string;
  color: string;
}>;

export type PulseIndicatorProps = Readonly<{
  show: boolean;
}>;
