/**
 * User Menu with Icons - FOR HEADER PROFILE DROPDOWN
 *
 * This file extends the user menu configuration from navigation.ts by adding icons.
 * It imports the base navigation items and enhances them with Tabler icons.
 *
 * Architecture: This file should ONLY add icon mappings, not recreate navigation items.
 */

import {
  IconBell,
  IconBuilding,
  IconHelp,
  IconKey,
  IconLink,
  IconLogout,
  IconPalette,
  IconSettings,
  IconShield,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react';

import { userMenu, userMenuGroups } from './navigation';

import type { NavigationItem } from './navigation';

/**
 * Icon mapping for user menu items
 * Maps menu item titles to their corresponding Tabler icons
 */
const iconMap: Record<string, React.ComponentType> = {
  'View Profile': IconUser,
  'Edit Profile': IconSettings,
  'Account Settings': IconSettings,
  'Notification Preferences': IconBell,
  'Display Preferences': IconPalette,
  Integrations: IconLink,
  'API Keys': IconKey,
  'Privacy & Security': IconShield,
  'Help & Support': IconHelp,
  'Switch Organization/Workspace': IconBuilding,
  'Invite Team Member': IconUserPlus,
  Logout: IconLogout,
};

/**
 * Adds icons to navigation items based on their title
 */
function addIconsToItems(items: NavigationItem[]): NavigationItem[] {
  return items.map((item) => ({
    ...item,
    icon: iconMap[item.title],
  }));
}

/**
 * User menu groups with icons for organized display
 * Extends userMenuGroups from navigation.ts with icon mappings
 */
export const userMenuGroupsWithIcons = {
  profile: addIconsToItems(userMenuGroups.profile),
  settings: addIconsToItems(userMenuGroups.settings),
  developer: addIconsToItems(userMenuGroups.developer),
  security: addIconsToItems(userMenuGroups.security),
  workspace: addIconsToItems(userMenuGroups.workspace),
  support: addIconsToItems(userMenuGroups.support),
  signout: addIconsToItems(userMenuGroups.signout),
} as const;

/**
 * Flat user menu with icons (for simple rendering)
 * Extends userMenu.items from navigation.ts with icon mappings
 */
export const userMenuItemsWithIcons: NavigationItem[] = addIconsToItems(userMenu.items);
