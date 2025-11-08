import { requireUser } from '@/lib/auth/session';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  FileText,
  BarChart3,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';
import { Separator } from '@/components/ui/separator';

/**
 * Dashboard Layout - Sidebar Navigation
 *
 * This layout provides:
 * - Fixed sidebar navigation
 * - Protected routes (requires authentication)
 * - Responsive sidebar (collapses on mobile)
 * - Proper content scrolling within main area
 */

const navigationItems = [
  {
    title: 'Overview',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Projects',
    icon: FolderKanban,
    href: '/dashboard/projects',
  },
  {
    title: 'Clients',
    icon: Users,
    href: '/dashboard/clients',
  },
  {
    title: 'Calendar',
    icon: Calendar,
    href: '/dashboard/calendar',
  },
  {
    title: 'Reports',
    icon: BarChart3,
    href: '/dashboard/reports',
  },
  {
    title: 'Documents',
    icon: FileText,
    href: '/dashboard/documents',
  },
];

const settingsItems = [
  {
    title: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated
  const user = await requireUser();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">S</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Skyll Platform</p>
              <p className="text-xs text-muted-foreground">Creative Agency</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <div className="p-2">
            <div className="flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent">
              <UserMenu />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.name || 'User'}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1">
            {/* Breadcrumbs or page title can go here */}
          </div>
        </header>

        {/* Main content area - this will scroll independently */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
