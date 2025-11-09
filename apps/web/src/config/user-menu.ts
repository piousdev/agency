/**
 * User Menu with Icons - FOR HEADER PROFILE DROPDOWN
 *
 * This file extends the user menu configuration from navigation.ts by adding icons.
 * It imports the base navigation items and enhances them with Lucide icons.
 *
 * Architecture: This file should ONLY add icon mappings, not recreate navigation items.
 */

import {
  Bell,
  Building2,
  HelpCircle,
  Key,
  Link,
  LogOut,
  Palette,
  Settings,
  Shield,
  User as UserIcon,
  UserPlus,
} from 'lucide-react';

import type { NavigationItem } from './navigation';
import { userMenu, userMenuGroups } from './navigation';

/**
 * Icon mapping for user menu items
 * Maps menu item titles to their corresponding Lucide icons
 */
const iconMap: Record<string, React.ComponentType> = {
  'View Profile': UserIcon,
  'Edit Profile': Settings,
  'Account Settings': Settings,
  'Notification Preferences': Bell,
  'Display Preferences': Palette,
  Integrations: Link,
  'API Keys': Key,
  'Privacy & Security': Shield,
  'Help & Support': HelpCircle,
  'Switch Organization/Workspace': Building2,
  'Invite Team Member': UserPlus,
  Logout: LogOut,
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
export const userMenuItemsWithIcons: NavigationItem[] = addIconsToItems(userMenu.items || []);
