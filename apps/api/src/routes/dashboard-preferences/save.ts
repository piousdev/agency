import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../../db';
import { userDashboardPreferences, type WidgetLayout } from '../../db/schema';
import { requireAuth, type AuthVariables } from '../../middleware/auth';
import { DEFAULT_LAYOUTS } from './get';

const app = new Hono<{ Variables: AuthVariables }>();

interface SavePreferencesInput {
  layout: WidgetLayout[];
  collapsedWidgets?: string[];
}

/**
 * PUT /
 * Save/update user's dashboard preferences
 */
app.put('/', requireAuth(), async (c) => {
  const currentUser = c.get('user');
  if (!currentUser) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }

  try {
    const body = await c.req.json<SavePreferencesInput>();
    const { layout, collapsedWidgets = [] } = body;

    // Validate layout
    if (!Array.isArray(layout)) {
      throw new HTTPException(400, { message: 'Layout must be an array' });
    }

    // Validate each widget in layout
    for (const widget of layout) {
      if (
        !widget.id ||
        !widget.type ||
        widget.position === undefined ||
        widget.visible === undefined
      ) {
        throw new HTTPException(400, { message: 'Invalid widget configuration' });
      }
      if (!['small', 'medium', 'large'].includes(widget.size)) {
        throw new HTTPException(400, { message: 'Invalid widget size' });
      }
    }

    // Check if preferences exist
    const existing = await db.query.userDashboardPreferences.findFirst({
      where: eq(userDashboardPreferences.userId, currentUser.id),
    });

    if (existing) {
      // Update existing preferences
      await db
        .update(userDashboardPreferences)
        .set({
          layout,
          collapsedWidgets,
        })
        .where(eq(userDashboardPreferences.userId, currentUser.id));
    } else {
      // Insert new preferences
      await db.insert(userDashboardPreferences).values({
        userId: currentUser.id,
        layout,
        collapsedWidgets,
      });
    }

    return c.json({
      success: true,
      data: {
        layout,
        collapsedWidgets,
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Error saving dashboard preferences:', error);
    return c.json({ success: false, error: 'Failed to save preferences' }, 500);
  }
});

/**
 * POST /reset
 * Reset user's preferences to role defaults
 */
app.post('/reset', requireAuth(), async (c) => {
  const currentUser = c.get('user');
  if (!currentUser) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }

  try {
    const body = await c.req.json<{ role?: string }>();
    // Use provided role, or determine from user type
    const defaultRole = currentUser.isInternal ? 'developer' : 'client';
    const role = (body.role || defaultRole).toLowerCase();
    const defaultLayout = DEFAULT_LAYOUTS[role] || DEFAULT_LAYOUTS.developer;

    // Delete existing preferences (will use defaults)
    await db
      .delete(userDashboardPreferences)
      .where(eq(userDashboardPreferences.userId, currentUser.id));

    return c.json({
      success: true,
      data: {
        layout: defaultLayout,
        collapsedWidgets: [],
        isDefault: true,
      },
    });
  } catch (error) {
    console.error('Error resetting dashboard preferences:', error);
    return c.json({ success: false, error: 'Failed to reset preferences' }, 500);
  }
});

export default app;
