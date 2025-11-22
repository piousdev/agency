import { Bell, Eye, Lock, Palette, Settings, Tags, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { requireUser } from '@/lib/auth/session';

export default async function ProjectSettingsPage() {
  await requireUser();

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      <div>
        <h1 className="text-4xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure default settings and preferences for projects
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Default View Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Default View</CardTitle>
            </div>
            <CardDescription>Choose your preferred project list view</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {['List', 'Board', 'Calendar', 'Timeline'].map((view) => (
                <Button
                  key={view}
                  variant={view === 'List' ? 'default' : 'outline'}
                  className="w-full"
                  disabled={view !== 'List'}
                >
                  {view}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              This will be your default view when opening the projects page
            </p>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Display</CardTitle>
            </div>
            <CardDescription>Customize how projects are displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Project Descriptions</Label>
                <p className="text-sm text-muted-foreground">
                  Display descriptions in project lists
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce spacing for more projects</p>
              </div>
              <Switch disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Progress Bars</Label>
                <p className="text-sm text-muted-foreground">
                  Display completion progress visually
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage project-related notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Project Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when projects are updated
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Status Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when project status changes
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Due Date Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Remind me before project delivery dates
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Team Assignments</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when team members are assigned
                </p>
              </div>
              <Switch disabled />
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Team Defaults</CardTitle>
            </div>
            <CardDescription>Default settings for team assignments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-assign Creator</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign yourself to new projects
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notify on Assignment</Label>
                <p className="text-sm text-muted-foreground">
                  Send email when assigned to projects
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Privacy</CardTitle>
            </div>
            <CardDescription>Control project visibility defaults</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default to Private</Label>
                <p className="text-sm text-muted-foreground">New projects are private by default</p>
              </div>
              <Switch disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Client Access</Label>
                <p className="text-sm text-muted-foreground">
                  Allow clients to view their projects
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </CardContent>
        </Card>

        {/* Tags & Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tags className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Tags & Categories</CardTitle>
            </div>
            <CardDescription>Manage project tags and categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Tags className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tag management coming soon</p>
              <Button variant="outline" className="mt-4" disabled>
                Manage Tags
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button disabled>
          <Settings className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Settings functionality coming soon. These are placeholder controls.
      </p>
    </div>
  );
}
