// constants/connection-status.constants.ts
import { IconWifi, IconWifiOff, IconLoader2 } from '@tabler/icons-react';
import type {
  ConnectionState,
  StatusConfig,
} from '@/components/dashboard/business-center/overview/shared/components/connection-status/types';

export const STATUS_CONFIGS: Readonly<Record<ConnectionState, StatusConfig>> = {
  connected: {
    icon: IconWifi,
    color: 'text-success',
    bgColor: 'bg-success/10',
    label: 'Connected',
    description: 'Real-time updates active',
  },
  connecting: {
    icon: IconLoader2,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    label: 'Connecting',
    description: 'Establishing connection...',
  },
  disconnected: {
    icon: IconWifiOff,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'Offline',
    description: 'Real-time updates unavailable',
  },
  error: {
    icon: IconWifiOff,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    label: 'Connection Error',
    description: 'Failed to connect. Retrying...',
  },
} as const;

export const CONNECTION_STATUS_CLASSES = {
  CONTAINER: 'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
  ICON: 'h-3.5 w-3.5',
  LABEL: 'font-medium',
  PULSE_CONTAINER: 'relative flex h-2 w-2',
  PULSE_RING: 'animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75',
  PULSE_DOT: 'relative inline-flex rounded-full h-2 w-2 bg-success',
  DOT: 'inline-block h-2 w-2 rounded-full',
} as const;

export const DOT_COLORS = {
  CONNECTED: 'bg-success',
  CONNECTING: 'bg-warning animate-pulse',
  ERROR: 'bg-destructive',
  DEFAULT: 'bg-muted-foreground',
} as const;

export const ARIA_LABELS = {
  STATUS_PREFIX: 'Connection status:',
} as const;

export const CONNECTION_DEFAULTS = {
  SHOW_LABEL: false,
} as const;
