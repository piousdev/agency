'use server';

import { getUser } from './get';
import {
  LAYOUT_PRESETS,
  type LayoutPreset,
} from '@/components/dashboard/business-center/overview/types';

const ROLE_MAPPINGS: Record<string, LayoutPreset> = {
  administrator: 'admin',
  'super admin': 'admin',
  'project manager': 'pm',
  'product manager': 'pm',
  engineer: 'developer',
  'software engineer': 'developer',
  'ui/ux designer': 'designer',
  'qa engineer': 'qa',
  tester: 'qa',
  customer: 'client',
  guest: 'client',
} as const;

const DEFAULT_ROLE: LayoutPreset = 'developer';

/**
 * Maps user roles to dashboard layout presets
 * NOT cached because getUser() requires authentication
 */
export async function getUserRole(userId: string): Promise<LayoutPreset> {
  try {
    const response = await getUser(userId);

    if (!response.success || !response.data.roles?.length) {
      return DEFAULT_ROLE;
    }

    for (const role of response.data.roles) {
      const normalized = role.name.toLowerCase();

      if (LAYOUT_PRESETS.includes(normalized as LayoutPreset)) {
        return normalized as LayoutPreset;
      }

      const mappedRole = ROLE_MAPPINGS[normalized];
      if (mappedRole) {
        return mappedRole;
      }
    }

    console.warn(`No matching preset found for user ${userId}, defaulting to ${DEFAULT_ROLE}`);
    return DEFAULT_ROLE;
  } catch (error) {
    console.error('Failed to fetch user role:', error);
    return DEFAULT_ROLE;
  }
}
