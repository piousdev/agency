import type { NavigationItem } from '@/config/navigation';

/**
 * Utility function to filter navigation items based on user roles
 */
export function filterNavigationByRole(
  items: NavigationItem[],
  userRoles: string[]
): NavigationItem[] {
  return items
    .filter((item) => {
      if (!item.roleGated) return true;
      return item.roleGated.some((role) => userRoles.includes(role));
    })
    .map((item) => ({
      ...item,
      items: item.items ? filterNavigationByRole(item.items, userRoles) : undefined,
    }));
}

/**
 * Utility function to get all navigation items as a flat array
 */
export function getFlatNavigationItems(items: NavigationItem[]): NavigationItem[] {
  return items.reduce<NavigationItem[]>((acc, item) => {
    acc.push(item);
    if (item.items) {
      acc.push(...getFlatNavigationItems(item.items));
    }
    return acc;
  }, []);
}
