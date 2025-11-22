/**
 * SKYLL Operations Platform - Navigation with Icons
 *
 * This file extends the base navigation configuration with icon assignments.
 * Icons are imported from Lucide React for consistency across the platform.
 */

import {
  Building2,
  CheckSquare,
  FileText,
  Headphones,
  HelpCircle,
  History,
  MessageSquare,
  Package,
  Search,
  Settings,
  Shield,
} from 'lucide-react';
import { BusinessCenter, Chart, Projects, Task } from '@/components/icons';
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
  workManagementGroup,
  businessCenterNavigation,
} from './navigation';

/**
 * Add icons to navigation items
 */

// Work Management icons
const businessCenterWithIcons: NavigationItem = {
  ...businessCenterNavigation,
  icon: BusinessCenter,
};

const projectsWithIcons: NavigationItem = {
  ...projectsNavigation,
  icon: Projects,
};

const tasksWithIcons: NavigationItem = {
  ...tasksNavigation,
  icon: Task,
};

const issuesWithIcons: NavigationItem = {
  ...issuesNavigation,
  icon: CheckSquare,
};

// Client & Service Management icons
const clientsWithIcons: NavigationItem = {
  ...clientsNavigation,
  icon: Building2,
};

const servicesWithIcons: NavigationItem = {
  ...servicesNavigation,
  icon: Package,
};

const requestsWithIcons: NavigationItem = {
  ...requestsNavigation,
  icon: Headphones,
};

// Collaboration & Content icons
const collaborationWithIcons: NavigationItem = {
  ...collaborationNavigation,
  icon: MessageSquare,
};

const contentWithIcons: NavigationItem = {
  ...contentNavigation,
  icon: FileText,
};

// Insights & Administration icons
const analyticsWithIcons: NavigationItem = {
  ...analyticsNavigation,
  icon: Chart,
};

const adminWithIcons: NavigationItem = {
  ...adminNavigation,
  icon: Shield,
};

const settingsWithIcons: NavigationItem = {
  ...settingsNavigation,
  icon: Settings,
};

const searchWithIcons: NavigationItem = {
  ...searchNavigation,
  icon: Search,
};

const helpWithIcons: NavigationItem = {
  ...helpNavigation,
  icon: HelpCircle,
};

const changelogWithIcons: NavigationItem = {
  ...changelogNavigation,
  icon: History,
};

/**
 * Navigation groups with icons
 */
export const workManagementGroupWithIcons: NavigationGroup = {
  ...workManagementGroup,
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
  workManagementGroupWithIcons,
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
