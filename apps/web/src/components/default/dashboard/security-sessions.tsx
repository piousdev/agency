'use client';

import {
  IconCircleCheck,
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDotsVertical,
} from '@tabler/icons-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type DeviceType = 'desktop' | 'laptop' | 'tablet' | 'mobile';

type ActiveSession = {
  id: string;
  deviceType: DeviceType;
  deviceName: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: Date;
  current: boolean;
};

// Mock data - in production, this would come from your API
const mockSessions: ActiveSession[] = [
  {
    id: '1',
    deviceType: 'desktop',
    deviceName: 'MacBook Pro',
    browser: 'Chrome 120',
    location: 'San Francisco, CA',
    ip: '192.168.1.1',
    lastActive: new Date(),
    current: true,
  },
  {
    id: '2',
    deviceType: 'mobile',
    deviceName: 'iPhone 15',
    browser: 'Safari',
    location: 'San Francisco, CA',
    ip: '192.168.1.5',
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
    current: false,
  },
  {
    id: '3',
    deviceType: 'laptop',
    deviceName: 'Work Laptop',
    browser: 'Firefox 121',
    location: 'New York, NY',
    ip: '10.0.0.15',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
    current: false,
  },
];

function getDeviceIcon(type: DeviceType) {
  switch (type) {
    case 'desktop':
      return IconDeviceDesktop;
    case 'laptop':
      return IconDeviceLaptop;
    case 'tablet':
      return IconDeviceTablet;
    case 'mobile':
      return IconDeviceMobile;
    default:
      return IconDeviceDesktop;
  }
}

function formatLastActive(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Active now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SessionsManager() {
  const [sessions, setSessions] = React.useState<ActiveSession[]>(mockSessions);

  const revokeSession = (sessionId: string) => {
    // In production, this would call an API
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const revokeAllOtherSessions = () => {
    // In production, this would call an API
    setSessions((prev) => prev.filter((s) => s.current));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage devices and locations where you're currently signed in
            </CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button variant="outline" size="sm" onClick={revokeAllOtherSessions}>
              Sign out all other sessions
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.deviceType);

          return (
            <div
              key={session.id}
              className={cn(
                'flex items-start gap-4 rounded-lg border p-4',
                session.current && 'border-primary bg-primary/5'
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <DeviceIcon className="size-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{session.deviceName}</h4>
                  {session.current && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <IconCircleCheck className="size-3" />
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{session.browser}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{session.location}</span>
                  <span>•</span>
                  <span>{session.ip}</span>
                  <span>•</span>
                  <span suppressHydrationWarning>{formatLastActive(session.lastActive)}</span>
                </div>
              </div>

              {!session.current && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <IconDotsVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => revokeSession(session.id)}>
                      Sign out this device
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Report suspicious activity
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">No active sessions</div>
        )}
      </CardContent>
    </Card>
  );
}
