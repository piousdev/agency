import { toast } from 'sonner';

import type { DeadlineItem } from '../types';

function formatICalDate(date: Date): string {
  return (date.toISOString().replace(/[-:]/g, '').split('.')[0] ?? '') + 'Z';
}

function generateICalEvent(deadline: DeadlineItem): string {
  const date = new Date(deadline.dueAt);
  const endDate = new Date(date.getTime() + 60 * 60 * 1000); // 1 hour duration
  const typeLabel = deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1);
  const description = `${typeLabel}${deadline.projectName ? ` - ${deadline.projectName}` : ''}`;

  return [
    'BEGIN:VEVENT',
    `DTSTART:${formatICalDate(date)}`,
    `DTEND:${formatICalDate(endDate)}`,
    `SUMMARY:${deadline.title}`,
    `DESCRIPTION:${description}`,
    `UID:${deadline.id}@skyll.app`,
    'END:VEVENT',
  ].join('\r\n');
}

function generateICalContent(deadlines: DeadlineItem[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Skyll//Deadlines//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...deadlines.map(generateICalEvent),
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDeadlinesToCalendar(deadlines: DeadlineItem[]): void {
  if (deadlines.length === 0) {
    toast.error('No deadlines to export');
    return;
  }

  const icalContent = generateICalContent(deadlines);
  downloadBlob(icalContent, 'skyll-deadlines.ics', 'text/calendar;charset=utf-8');

  const count = deadlines.length;
  toast.success(`Exported ${String(count)} deadline${count > 1 ? 's' : ''} to calendar`);
}
