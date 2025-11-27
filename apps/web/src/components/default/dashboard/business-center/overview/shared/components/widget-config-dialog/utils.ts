// lib/widget-config-dialog.utils.ts
import type { DeadlineType } from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/types';

export const toggleArrayItem = <T>(array: T[], item: T): T[] => {
  return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
};

export const isDeadlineTypeSelected = (
  types: DeadlineType[] | undefined,
  type: DeadlineType
): boolean => {
  return types?.includes(type);
};
