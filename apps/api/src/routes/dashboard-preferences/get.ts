import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../../db';
import { userDashboardPreferences, type WidgetLayout } from '../../db/schema';
import { requireAuth, type AuthVariables } from '../../middleware/auth';

const app = new Hono<{ Variables: AuthVariables }>();

// Default layouts for each role
const DEFAULT_LAYOUTS: Record<string, WidgetLayout[]> = {
  admin: [
    { id: 'org-health', type: 'organization-health', size: 'medium', position: 0, visible: true },
    { id: 'critical-alerts', type: 'critical-alerts', size: 'medium', position: 1, visible: true },
    { id: 'team-status', type: 'team-status', size: 'medium', position: 2, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 3,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 4, visible: true },
    {
      id: 'financial-snapshot',
      type: 'financial-snapshot',
      size: 'medium',
      position: 5,
      visible: true,
    },
  ],
  pm: [
    { id: 'org-health', type: 'organization-health', size: 'medium', position: 0, visible: true },
    { id: 'critical-alerts', type: 'critical-alerts', size: 'medium', position: 1, visible: true },
    { id: 'my-work-today', type: 'my-work-today', size: 'medium', position: 2, visible: true },
    { id: 'team-status', type: 'team-status', size: 'medium', position: 3, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 4, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 5,
      visible: true,
    },
  ],
  developer: [
    { id: 'my-work-today', type: 'my-work-today', size: 'large', position: 0, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 1, visible: true },
    { id: 'blockers', type: 'blockers', size: 'medium', position: 2, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 3,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 4, visible: true },
  ],
  designer: [
    { id: 'my-work-today', type: 'my-work-today', size: 'large', position: 0, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 1, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 2,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 3, visible: true },
  ],
  qa: [
    { id: 'my-work-today', type: 'my-work-today', size: 'large', position: 0, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 1, visible: true },
    { id: 'blockers', type: 'blockers', size: 'medium', position: 2, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 3,
      visible: true,
    },
  ],
  client: [
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 0,
      visible: true,
    },
    {
      id: 'financial-snapshot',
      type: 'financial-snapshot',
      size: 'medium',
      position: 1,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 2, visible: true },
  ],
};

/**
 * GET /
 * Get current user's dashboard preferences
 * Returns defaults if no preferences exist
 */
app.get('/', requireAuth(), async (c) => {
  const currentUser = c.get('user');
  if (!currentUser) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }

  try {
    const preferences = await db.query.userDashboardPreferences.findFirst({
      where: eq(userDashboardPreferences.userId, currentUser.id),
    });

    if (!preferences) {
      // Return default layout based on user type (internal vs client)
      const layoutKey: 'developer' | 'client' = currentUser.isInternal ? 'developer' : 'client';
      const defaultLayout = DEFAULT_LAYOUTS[layoutKey];

      return c.json({
        success: true,
        data: {
          layout: defaultLayout,
          collapsedWidgets: [],
          isDefault: true,
        },
      });
    }

    return c.json({
      success: true,
      data: {
        layout: preferences.layout,
        collapsedWidgets: preferences.collapsedWidgets ?? [],
        isDefault: false,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard preferences:', error);
    return c.json({ success: false, error: 'Failed to fetch preferences' }, 500);
  }
});

export default app;
export { DEFAULT_LAYOUTS };
