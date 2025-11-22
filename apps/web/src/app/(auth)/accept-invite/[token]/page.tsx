import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { validateInvitation } from '@/lib/api/invitations';
import { AcceptInviteForm } from './form';

/**
 * Server Component that validates invitation token server-side
 * before rendering the acceptance form
 */
export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Validate invitation token server-side
  let validationResult: Awaited<ReturnType<typeof validateInvitation>>;
  try {
    validationResult = await validateInvitation(token);
  } catch (error) {
    console.error('Token validation error:', error);
    return <InvalidInvitationCard message="Failed to validate invitation. Please try again." />;
  }

  // Check if invitation is valid
  if (!validationResult.valid || !validationResult.invitation) {
    return (
      <InvalidInvitationCard
        message={validationResult.message || 'This invitation is invalid or has expired'}
      />
    );
  }

  // Render form with validated invitation data
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <AcceptInviteForm token={token} invitation={validationResult.invitation} />
    </div>
  );
}

/**
 * Error state component for invalid/expired invitations
 */
function InvalidInvitationCard({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-error">Invalid Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-error/10 p-4 text-sm text-error-foreground border border-error">
            {message}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => redirect('/login')} variant="outline" className="w-full">
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
