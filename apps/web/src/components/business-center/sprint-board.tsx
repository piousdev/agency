'use client';

import { useState, useMemo } from 'react';

import {
  IconGripVertical,
  IconDotsVertical,
  IconEye,
  
  IconUser,
  IconTag,
  IconClock,
} from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


import type { Sprint } from '@/lib/api/sprints/types';

/**
 * Ticket type for sprint board
 * This should match your actual ticket type
 */
interface SprintTicket {
  id: string;
  title: string;
  status: string;
  priority?: string;
  storyPoints?: number | null;
  assignee?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  labels?: {
    id: string;
    name: string;
    color: string;
  }[];
}

interface SprintBoardColumn {
  id: string;
  title: string;
  status: string[];
  color?: string;
}

interface SprintBoardProps {
  sprint: Sprint;
  tickets: SprintTicket[];
  columns?: SprintBoardColumn[];
  onTicketClick?: (ticket: SprintTicket) => void;
  onTicketMove?: (ticketId: string, newStatus: string) => Promise<void>;
  canEdit?: boolean;
}

const defaultColumns: SprintBoardColumn[] = [
  { id: 'todo', title: 'To Do', status: ['open', 'new', 'backlog'], color: 'bg-gray-100' },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: ['in_progress', 'in-progress'],
    color: 'bg-blue-50',
  },
  {
    id: 'review',
    title: 'Review',
    status: ['review', 'in_review', 'testing'],
    color: 'bg-purple-50',
  },
  {
    id: 'done',
    title: 'Done',
    status: ['done', 'closed', 'resolved', 'completed'],
    color: 'bg-green-50',
  },
];

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
  lowest: 'bg-gray-400',
};

/**
 * Sprint Board Component - Kanban view for sprint tickets
 */
export function SprintBoard({
  sprint,
  tickets,
  columns = defaultColumns,
  onTicketClick,
  onTicketMove,
  canEdit = true,
}: SprintBoardProps) {
  const [movingTicketId, setMovingTicketId] = useState<string | null>(null);

  // Group tickets by column
  const ticketsByColumn = useMemo(() => {
    const grouped: Record<string, SprintTicket[]> = {};

    columns.forEach((col) => {
      grouped[col.id] = [];
    });

    tickets.forEach((ticket) => {
      const column = columns.find((col) =>
        col.status.some((s) => s.toLowerCase() === ticket.status.toLowerCase())
      );
      if (column) {
        const arr = grouped[column.id];
        if (arr) arr.push(ticket);
      } else {
        // Put in first column if no match
        const firstColumn = columns[0];
        if (firstColumn) {
          const arr = grouped[firstColumn.id];
          if (arr) arr.push(ticket);
        }
      }
    });

    return grouped;
  }, [tickets, columns]);

  // Calculate column stats
  const columnStats = useMemo(() => {
    const stats: Record<string, { count: number; points: number }> = {};
    columns.forEach((col) => {
      const colTickets = ticketsByColumn[col.id];
      stats[col.id] = {
        count: colTickets.length,
        points: colTickets.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0),
      };
    });
    return stats;
  }, [ticketsByColumn, columns]);

  const handleMoveTicket = async (ticketId: string, targetStatus: string) => {
    if (!onTicketMove) return;
    setMovingTicketId(ticketId);
    try {
      await onTicketMove(ticketId, targetStatus);
    } finally {
      setMovingTicketId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{sprint.name}</h3>
          <p className="text-sm text-muted-foreground">
            {tickets.length} tickets · {tickets.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0)}{' '}
            points
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tickets={ticketsByColumn[column.id]}
              stats={columnStats[column.id]}
              movingTicketId={movingTicketId}
              canEdit={canEdit}
              columns={columns}
              onTicketClick={onTicketClick}
              onMoveTicket={handleMoveTicket}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

interface BoardColumnProps {
  column: SprintBoardColumn;
  tickets: SprintTicket[];
  stats?: { count: number; points: number };
  movingTicketId: string | null;
  canEdit: boolean;
  columns: SprintBoardColumn[];
  onTicketClick?: (ticket: SprintTicket) => void;
  onMoveTicket: (ticketId: string, targetStatus: string) => void;
}

function BoardColumn({
  column,
  tickets,
  stats,
  movingTicketId,
  canEdit,
  columns,
  onTicketClick,
  onMoveTicket,
}: BoardColumnProps) {
  return (
    <div className={cn('w-72 shrink-0 rounded-lg', column.color ?? 'bg-muted/50')}>
      {/* Column Header */}
      <div className="p-3 border-b bg-background/50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{column.title}</h4>
          <Badge variant="secondary" className="text-xs">
            {stats?.count}
          </Badge>
        </div>
        {stats && stats.points > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{stats.points} points</p>
        )}
      </div>

      {/* Tickets */}
      <div className="p-2 space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No tickets</div>
        ) : (
          tickets.map((ticket) => (
            <BoardTicketCard
              key={ticket.id}
              ticket={ticket}
              isMoving={movingTicketId === ticket.id}
              canEdit={canEdit}
              columns={columns}
              currentColumnId={column.id}
              onClick={() => onTicketClick?.(ticket)}
              onMove={onMoveTicket}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface BoardTicketCardProps {
  ticket: SprintTicket;
  isMoving: boolean;
  canEdit: boolean;
  columns: SprintBoardColumn[];
  currentColumnId: string;
  onClick?: () => void;
  onMove: (ticketId: string, targetStatus: string) => void;
}

function BoardTicketCard({
  ticket,
  isMoving,
  canEdit,
  columns,
  currentColumnId,
  onClick,
  onMove,
}: BoardTicketCardProps) {
  const otherColumns = columns.filter((col) => col.id !== currentColumnId);

  return (
    <Card
      className={cn('cursor-pointer hover:shadow-md transition-shadow', isMoving && 'opacity-50')}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header with drag handle and menu */}
        <div className="flex items-start justify-between gap-2">
          <div
            className="flex items-start gap-2 flex-1 min-w-0"
            onClick={onClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }}
            role="button"
            tabIndex={0}
          >
            {canEdit && (
              <IconGripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 cursor-grab" />
            )}
            <span className="text-sm font-medium line-clamp-2">{ticket.title}</span>
          </div>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
                  <IconDotsVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onClick}>
                  <IconEye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {otherColumns
                  .filter((col) => col.status[0])
                  .map((col) => {
                    const targetStatus = col.status[0];
                    if (!targetStatus) return null;
                    return (
                      <DropdownMenuItem
                        key={col.id}
                        onClick={() => onMove(ticket.id, targetStatus)}
                        disabled={isMoving}
                      >
                        Move to {col.title}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Labels */}
        {ticket.labels && ticket.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ticket.labels.slice(0, 3).map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className="text-xs px-1.5 py-0"
                style={{ borderColor: label.color, color: label.color }}
              >
                {label.name}
              </Badge>
            ))}
            {ticket.labels.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                +{ticket.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer with meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {/* Priority indicator */}
            {ticket.priority && (
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  priorityColors[ticket.priority] ?? 'bg-gray-400'
                )}
                title={ticket.priority}
              />
            )}
            {/* Story points */}
            {ticket.storyPoints !== undefined && ticket.storyPoints !== null && (
              <span className="flex items-center gap-0.5">
                <IconClock className="h-3 w-3" />
                {ticket.storyPoints}
              </span>
            )}
          </div>

          {/* Assignee */}
          {ticket.assignee ? (
            <Avatar className="h-5 w-5">
              <AvatarImage src={ticket.assignee.image ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {ticket.assignee.name?.charAt(0) ?? '?'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <IconUser className="h-3 w-3 text-muted-foreground/50" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty state component for when there are no tickets
 */
export function SprintBoardEmpty({ sprintName }: { sprintName: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <div className="space-y-2">
          <IconTag className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="font-medium">No tickets in {sprintName}</h3>
          <p className="text-sm text-muted-foreground">
            Add tickets to this sprint to see them on the board
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
