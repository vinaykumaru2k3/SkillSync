'use client';

import { useQuery } from '@tanstack/react-query';
import { githubService } from '@/lib/api/services';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';

export function GitHubContributionGraph() {
  const { data: calendar, isLoading } = useQuery({
    queryKey: ['github-contribution-calendar'],
    queryFn: githubService.getContributionCalendar,
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <Spinner />
        </div>
      </Card>
    );
  }

  if (!calendar || Object.keys(calendar).length === 0) {
    return null;
  }

  // Generate last 365 days
  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const days = generateDays();
  
  // Group days by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  days.forEach((day, index) => {
    if (index === 0) {
      // Fill empty days at the start of the first week
      const dayOfWeek = day.getDay();
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(new Date(0)); // Placeholder
      }
    }
    
    currentWeek.push(day);
    
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const getContributionLevel = (count: number) => {
    if (count === 0) return 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600';
    if (count < 3) return 'bg-green-300 dark:bg-green-800 border border-green-400 dark:border-green-700';
    if (count < 6) return 'bg-green-500 dark:bg-green-600 border border-green-600 dark:border-green-500';
    if (count < 10) return 'bg-green-600 dark:bg-green-500 border border-green-700 dark:border-green-400';
    return 'bg-green-700 dark:bg-green-400 border border-green-800 dark:border-green-300';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const totalContributions = Object.values(calendar).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {totalContributions} contributions in the last year
        </h3>
      </div>

      {/* Contribution Graph */}
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                if (day.getTime() === 0) {
                  // Placeholder day
                  return <div key={dayIndex} className="w-3 h-3" />;
                }

                const dateKey = getDateKey(day);
                const count = calendar[dateKey] || 0;
                const level = getContributionLevel(count);

                return (
                  <div
                    key={dayIndex}
                    className={`w-3.5 h-3.5 rounded ${level} hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all hover:scale-110`}
                    title={`${formatDate(day)}: ${count} contribution${count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3.5 h-3.5 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
          <div className="w-3.5 h-3.5 rounded bg-green-300 dark:bg-green-800 border border-green-400 dark:border-green-700" />
          <div className="w-3.5 h-3.5 rounded bg-green-500 dark:bg-green-600 border border-green-600 dark:border-green-500" />
          <div className="w-3.5 h-3.5 rounded bg-green-600 dark:bg-green-500 border border-green-700 dark:border-green-400" />
          <div className="w-3.5 h-3.5 rounded bg-green-700 dark:bg-green-400 border border-green-800 dark:border-green-300" />
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}
