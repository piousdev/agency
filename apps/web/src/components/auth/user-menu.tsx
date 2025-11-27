/**
 * User Menu Component - Header Profile Dropdown
 *
 * This component demonstrates:
 * Client component for interactivity only (dropdown)
 * Uses useAuth hook for session data
 * Minimal client JavaScript
 * No data fetching (session fetched by Better-Auth)
 * Comprehensive menu from centralized configuration
 */

'use client';

import Link from 'next/link';

import { UserMenuSkeleton } from '@/components/auth/user-menu-skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { userMenuGroupsWithIcons } from '@/config/user-menu';
import { useAuth } from '@/lib/hooks/use-auth';

export function UserMenu() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  // Loading state
  if (isLoading) {
    return <UserMenuSkeleton />;
  }

  // Not authenticated - show sign in button
  if (!isAuthenticated || !user) {
    return (
      <Button asChild variant="default" size="sm">
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  // Authenticated - show user menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full">
          <Avatar className="size-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Profile Group */}
        <DropdownMenuGroup>
          {userMenuGroupsWithIcons.profile.map((item) => {
            if (!item.icon || !item.url) return null;
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.title} asChild>
                <Link href={item.url} className="cursor-pointer">
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Settings Group */}
        <DropdownMenuGroup>
          {userMenuGroupsWithIcons.settings.map((item) => {
            if (!item.icon || !item.url) return null;
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.title} asChild>
                <Link href={item.url} className="cursor-pointer">
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Developer Group */}
        <DropdownMenuGroup>
          {userMenuGroupsWithIcons.developer.map((item) => {
            if (!item.icon || !item.url) return null;
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.title} asChild>
                <Link href={item.url} className="cursor-pointer">
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Security Group */}
        <DropdownMenuGroup>
          {userMenuGroupsWithIcons.security.map((item) => {
            if (!item.icon || !item.url) return null;
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.title} asChild>
                <Link href={item.url} className="cursor-pointer">
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Workspace Group */}
        <DropdownMenuGroup>
          {userMenuGroupsWithIcons.workspace.map((item) => {
            if (!item.icon || !item.url) return null;
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.title} asChild>
                <Link href={item.url} className="cursor-pointer">
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Support Group */}
        <DropdownMenuGroup>
          {userMenuGroupsWithIcons.support.map((item) => {
            if (!item.icon || !item.url) return null;
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.title} asChild>
                <Link href={item.url} className="cursor-pointer">
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Logout */}
        {userMenuGroupsWithIcons.signout.map((item) => {
          if (!item.icon) return null;
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.title}
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={signOut}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
