import { useMemo } from 'react';
import { useOverviewData } from '@/components/dashboard/business-center/overview/context/overview-data-context';
import { MOCK_DEADLINES } from '@/components/dashboard/business-center/overview/constants/ud-mock-data';
import type {
  DeadlineItem,
  UseDeadlinesOptions,
  UseDeadlinesReturn,
} from '@/components/dashboard/business-center/overview/types';

export function useDeadlines(options: UseDeadlinesOptions = {}): UseDeadlinesReturn {
  const { deadlines: propDeadlines } = options;
  const overviewData = useOverviewData();

  const deadlines = useMemo<DeadlineItem[]>(() => {
    // Priority: server data > prop data > mock data
    if (overviewData?.deadlines) {
      return overviewData.deadlines.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type === 'task' ? 'ticket' : d.type,
        dueAt: d.dueDate,
        projectName: d.projectName || undefined,
        clientName: undefined,
        isOverdue: new Date(d.dueDate) < new Date(),
      }));
    }

    return propDeadlines ?? MOCK_DEADLINES;
  }, [overviewData?.deadlines, propDeadlines]);

  const overdueCount = useMemo(
    () => deadlines.filter((d) => new Date(d.dueAt) < new Date()).length,
    [deadlines]
  );

  return {
    deadlines,
    isEmpty: deadlines.length === 0,
    overdueCount,
  };
}
