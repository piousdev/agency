/**
 * SKYLL Operations Platform - Navigation with Icons
 *
 * This file extends the base navigation configuration with icon assignments.
 * Icons are imported from Tabler Icons for consistency across the platform.
 */

import {
  IconBriefcase,
  IconBuilding,
  IconCheckbox,
  IconChartBar,
  IconFileText,
  IconFolders,
  IconHeadphones,
  IconHelpCircle,
  IconHistory,
  IconListDetails,
  IconMessage,
  IconPackage,
  IconSearch,
  IconSettings,
  IconShield,
} from '@tabler/icons-react';

import {
  administrationGroup,
  adminNavigation,
  analyticsNavigation,
  changelogNavigation,
  clientManagementGroup,
  clientsNavigation,
  collaborationContentGroup,
  collaborationNavigation,
  contentNavigation,
  generalGroup,
  helpNavigation,
  insightsGroup,
  issuesNavigation,
  type NavigationGroup,
  type NavigationItem,
  projectsNavigation,
  requestsNavigation,
  searchNavigation,
  serviceManagementGroup,
  servicesNavigation,
  settingsNavigation,
  tasksNavigation,
  businessCenterGroup,
  businessCenterNavigation,
} from './navigation';

/**
 * Add icons to navigation items
 */

// Business Center icons
const businessCenterWithIcons: NavigationItem = {
  ...businessCenterNavigation,
  icon: IconBriefcase,
};

const projectsWithIcons: NavigationItem = {
  ...projectsNavigation,
  icon: IconFolders,
};

const tasksWithIcons: NavigationItem = {
  ...tasksNavigation,
  icon: IconListDetails,
};

const issuesWithIcons: NavigationItem = {
  ...issuesNavigation,
  icon: IconCheckbox,
};

// Client & Service Management icons
const clientsWithIcons: NavigationItem = {
  ...clientsNavigation,
  icon: IconBuilding,
};

const servicesWithIcons: NavigationItem = {
  ...servicesNavigation,
  icon: IconPackage,
};

const requestsWithIcons: NavigationItem = {
  ...requestsNavigation,
  icon: IconHeadphones,
};

// Collaboration & Content icons
const collaborationWithIcons: NavigationItem = {
  ...collaborationNavigation,
  icon: IconMessage,
};

const contentWithIcons: NavigationItem = {
  ...contentNavigation,
  icon: IconFileText,
};

// Insights & Administration icons
const analyticsWithIcons: NavigationItem = {
  ...analyticsNavigation,
  icon: IconChartBar,
};

const adminWithIcons: NavigationItem = {
  ...adminNavigation,
  icon: IconShield,
};

const settingsWithIcons: NavigationItem = {
  ...settingsNavigation,
  icon: IconSettings,
};

const searchWithIcons: NavigationItem = {
  ...searchNavigation,
  icon: IconSearch,
};

const helpWithIcons: NavigationItem = {
  ...helpNavigation,
  icon: IconHelpCircle,
};

const changelogWithIcons: NavigationItem = {
  ...changelogNavigation,
  icon: IconHistory,
};

/**
 * Navigation groups with icons
 */
export const businessCenterGroupWithIcons: NavigationGroup = {
  ...businessCenterGroup,
  items: [businessCenterWithIcons, projectsWithIcons, tasksWithIcons, issuesWithIcons],
};

export const clientManagementGroupWithIcons: NavigationGroup = {
  ...clientManagementGroup,
  items: [clientsWithIcons],
};

export const serviceManagementGroupWithIcons: NavigationGroup = {
  ...serviceManagementGroup,
  items: [servicesWithIcons, requestsWithIcons],
};

export const collaborationContentGroupWithIcons: NavigationGroup = {
  ...collaborationContentGroup,
  items: [collaborationWithIcons, contentWithIcons],
};

export const insightsGroupWithIcons: NavigationGroup = {
  ...insightsGroup,
  items: [analyticsWithIcons],
};

export const administrationGroupWithIcons: NavigationGroup = {
  ...administrationGroup,
  items: [adminWithIcons],
};

export const generalGroupWithIcons: NavigationGroup = {
  ...generalGroup,
  items: [settingsWithIcons, searchWithIcons, helpWithIcons, changelogWithIcons],
};

/**
 * Complete sidebar navigation with icons
 */
export const sidebarNavigationWithIcons: NavigationGroup[] = [
  businessCenterGroupWithIcons,
  clientManagementGroupWithIcons,
  serviceManagementGroupWithIcons,
  collaborationContentGroupWithIcons,
  insightsGroupWithIcons,
  administrationGroupWithIcons,
  generalGroupWithIcons,
];

/**
 * Export individual sections with icons for flexibility
 */
export {
  businessCenterWithIcons,
  projectsWithIcons,
  tasksWithIcons,
  issuesWithIcons,
  clientsWithIcons,
  servicesWithIcons,
  requestsWithIcons,
  collaborationWithIcons,
  contentWithIcons,
  analyticsWithIcons,
  adminWithIcons,
  settingsWithIcons,
  searchWithIcons,
  helpWithIcons,
  changelogWithIcons,
};
