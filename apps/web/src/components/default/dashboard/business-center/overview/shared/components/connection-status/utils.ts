import {
  STATUS_CONFIGS,
  DOT_COLORS,
} from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/constants';

import type {
  ConnectionState,
  StatusConfig,
} from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/types';

export const getStatusConfig = (state: ConnectionState): StatusConfig => {
  return STATUS_CONFIGS[state];
};

export const getAriaLabel = (label: string): string => {
  return `Connection status: ${label}`;
};

export const getDotColor = (
  isConnected: boolean,
  isConnecting: boolean,
  isError: boolean
): string => {
  if (isConnected) return DOT_COLORS.CONNECTED;
  if (isConnecting) return DOT_COLORS.CONNECTING;
  if (isError) return DOT_COLORS.ERROR;
  return DOT_COLORS.DEFAULT;
};
