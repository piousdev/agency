'use client';

import { IconMail } from '@tabler/icons-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

// Extract the form content into a separate component to reuse in both contexts
function OptInFormContent() {
  return (
    <form>
      <div className="grid gap-2.5">
        <SidebarInput type="email" placeholder="Email" />
        <Button
          className="bg-sidebar-primary text-sidebar-primary-foreground w-full shadow-none"
          size="sm"
        >
          Subscribe
        </Button>
      </div>
    </form>
  );
}

export function OptInFormAdaptive() {
  const { state } = useSidebar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isCollapsed = state === 'collapsed';

  // When collapsed, show an icon button that opens a dialog using SidebarMenu structure
  if (isCollapsed) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <SidebarMenuButton tooltip="Subscribe to newsletter">
                <IconMail />
                <span>Subscribe</span>
              </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Subscribe to our newsletter</DialogTitle>
                <DialogDescription>
                  Opt-in to receive updates and news about the sidebar.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <OptInFormContent />
              </div>
            </DialogContent>
          </Dialog>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // When expanded, show the full card form
  return (
    <Card className="gap-2 py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Subscribe to our newsletter</CardTitle>
        <CardDescription>Opt-in to receive updates and news about the sidebar.</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <OptInFormContent />
      </CardContent>
    </Card>
  );
}
