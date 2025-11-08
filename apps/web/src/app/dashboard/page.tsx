import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth/session';

/**
 * Protected Dashboard Page - Server Component Example
 *
 * Demonstrates Defense-in-Depth Security:
 * 1. Middleware already performed optimistic redirect (Layer 1)
 * 2. requireUser() validates session with database (Layer 2 - REAL SECURITY)
 * 3. Any mutations will use Server Actions with validation (Layer 3)
 *
 * This page is a Server Component by default - no "use client" needed!
 */
export default async function DashboardPage() {
  // Layer 2: Server-side validation with database check
  // If session is invalid, user is redirected to /login
  const user = await requireUser();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.name || user.email}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Name:</span>
                <p className="text-sm text-gray-600">{user.name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Email:</span>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium">User ID:</span>
                <p className="text-sm text-gray-600 font-mono">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Type</CardTitle>
            <CardDescription>Your access level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Status:</span>
                <p className="text-sm text-gray-600">
                  {user.emailVerified ? '✅ Verified' : '⚠️ Unverified'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Role:</span>
                <p className="text-sm text-gray-600">
                  {user.isInternal ? 'Internal Team Member' : 'Client'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full">
              Settings
            </Button>
            <form action="/api/auth/sign-out" method="POST">
              <Button variant="destructive" className="w-full" type="submit">
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
