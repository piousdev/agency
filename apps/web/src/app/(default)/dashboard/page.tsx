import { TwoFactorManagement } from '@/components/default/dashboard/security-2fa';
import { SessionsManager } from '@/components/default/dashboard/security-sessions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Page() {
  return (
    <div className="p-8">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your enhanced productivity workspace</p>
        </div>

        {/* Feature Showcase Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Navigation Features Card */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Features</CardTitle>
              <CardDescription>Enhanced ways to navigate and find content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <kbd className="text-xs">⌘K</kbd>
                </div>
                <div>
                  <p className="font-medium">Command Palette</p>
                  <p className="text-muted-foreground">
                    Quick search for pages, actions, recent items, and favorites
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <kbd className="text-xs">⌘/</kbd>
                </div>
                <div>
                  <p className="font-medium">Keyboard Shortcuts</p>
                  <p className="text-muted-foreground">View all available keyboard shortcuts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <span className="text-xs">🔖</span>
                </div>
                <div>
                  <p className="font-medium">Breadcrumbs</p>
                  <p className="text-muted-foreground">
                    Always know where you are in the hierarchy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productivity Features Card */}
          <Card>
            <CardHeader>
              <CardTitle>Productivity Features</CardTitle>
              <CardDescription>Tools to work faster and more efficiently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <span className="text-xs">⭐</span>
                </div>
                <div>
                  <p className="font-medium">Favorites & Recent</p>
                  <p className="text-muted-foreground">
                    Star items and access recently viewed content
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <span className="text-xs">🔍</span>
                </div>
                <div>
                  <p className="font-medium">Saved Filters</p>
                  <p className="text-muted-foreground">
                    Save complex filter combinations for reuse
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium">Bulk Actions</p>
                  <p className="text-muted-foreground">
                    Select multiple items and perform batch operations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Center</CardTitle>
              <CardDescription>Stay updated with what matters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Access the notification center from the header to view all your notifications with
                filtering and search capabilities.
              </p>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li>Filter by read/unread status</li>
                <li>Mark individual or all as read</li>
                <li>View notification history</li>
                <li>Quick actions on notifications</li>
              </ul>
            </CardContent>
          </Card>

          {/* Customization Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customization</CardTitle>
              <CardDescription>Make the platform work your way</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Customize your sidebar layout by reordering sections or hiding ones you don't use
                frequently. Access customization from the sidebar footer.
              </p>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li>Drag to reorder sidebar sections</li>
                <li>Toggle section visibility</li>
                <li>Reset to default layout</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Security Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Security & Privacy</h2>
            <p className="text-muted-foreground">
              Manage your account security and active sessions
            </p>
          </div>

          <div className="space-y-6">
            {/* 2FA Management */}
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Protect your account with an additional security layer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TwoFactorManagement />
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <SessionsManager />
          </div>
        </div>

        {/* Tips Section */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">⌘K</kbd> from
                  anywhere to quickly jump to any page or action
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Star your frequently used pages to access them quickly from the command palette
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Save your complex filter combinations to reuse them across different sessions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Use bulk actions to update multiple items at once - select items and see available
                  actions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Customize your sidebar layout to match your workflow by reordering or hiding
                  sections
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
