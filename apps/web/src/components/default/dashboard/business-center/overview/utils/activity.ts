import { ACTIVITY_TYPE_CONFIG, FALLBACK_ACTIVITY_CONFIG } from '../constants/activity-config';
import { isKnownActivityType, type ActivityType, type ActivityTypeConfig } from '../types';

const INITIALS_MAX_LENGTH = 2;

/**
 * Extracts initials from a name string.
 */
export function getInitials(name: string): string {
  if (!name.trim()) return '';

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, INITIALS_MAX_LENGTH);
}

/**
 * Formats a timestamp to a relative time string.
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${String(diffMinutes)}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${String(diffHours)}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';

  return `${String(diffDays)}d ago`;
}

/**
 * Gets the config for an activity type with fallback for unknown types.
 */
export function getActivityConfig(type: ActivityType): ActivityTypeConfig {
  if (isKnownActivityType(type)) {
    return ACTIVITY_TYPE_CONFIG[type];
  }
  return FALLBACK_ACTIVITY_CONFIG;
}

/**
 * Sorts activities by timestamp (newest first).
 */
export function sortByTimestamp<T extends { timestamp: string }>(items: readonly T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Deduplicates items by ID, keeping first occurrence.
 */
export function dedupeById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
