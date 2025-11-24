'use server';

import { revalidatePath } from 'next/cache';
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/api/notifications';
import type {
  ListNotificationsParams,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
  NotificationUpdateResponse,
  NotificationDeleteResponse,
} from '@/lib/api/notifications';

/**
 * Server action to fetch notifications
 */
export async function getNotificationsAction(
  params: ListNotificationsParams = {}
): Promise<
  { success: true; data: PaginatedNotificationsResponse } | { success: false; error: string }
> {
  try {
    const result = await listNotifications(params);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Server action to get unread notification count
 */
export async function getUnreadCountAction(): Promise<
  { success: true; data: UnreadCountResponse } | { success: false; error: string }
> {
  try {
    const result = await getUnreadCount();
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Server action to mark a single notification as read/unread
 */
export async function markNotificationReadAction(
  id: string,
  read: boolean
): Promise<
  { success: true; data: NotificationUpdateResponse } | { success: false; error: string }
> {
  try {
    const result = await markNotificationRead(id, { read });

    // Revalidate dashboard to update notification counts
    revalidatePath('/dashboard/business-center');

    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Server action to mark all notifications as read
 */
export async function markAllNotificationsReadAction(
  notificationIds?: string[]
): Promise<
  { success: true; data: NotificationUpdateResponse } | { success: false; error: string }
> {
  try {
    const result = await markAllNotificationsRead({ notificationIds });

    // Revalidate dashboard to update notification counts
    revalidatePath('/dashboard/business-center');

    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Server action to delete a notification
 */
export async function deleteNotificationAction(
  id: string
): Promise<
  { success: true; data: NotificationDeleteResponse } | { success: false; error: string }
> {
  try {
    const result = await deleteNotification(id);

    // Revalidate dashboard to update notification counts
    revalidatePath('/dashboard/business-center');

    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
