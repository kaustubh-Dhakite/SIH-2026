import React from 'react';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { formatDate } from '../../utils/format';

interface Activity {
  id: string;
  type: string;
  status: string;
  created: string;
  duration?: number;
}

// Mock data
const mockActivities: Activity[] = [
  { id: '1', type: 'Document Analysis', status: 'completed', created: new Date().toISOString(), duration: 12.5 },
  { id: '2', type: 'Code Generation', status: 'running', created: new Date(Date.now() - 300000).toISOString() },
  { id: '3', type: 'RAG Query', status: 'completed', created: new Date(Date.now() - 600000).toISOString(), duration: 3.2 },
];

export const RecentActivity: React.FC = () => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card title="Recent Activity">
      {mockActivities.length === 0 ? (
        <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
          No recent activity
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border">
                <th className="text-left py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Task ID
                </th>
                <th className="text-left py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Type
                </th>
                <th className="text-left py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Status
                </th>
                <th className="text-left py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Created
                </th>
                <th className="text-left py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {mockActivities.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-light-border dark:border-dark-border hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary"
                >
                  <td className="py-3 text-sm text-light-text-primary dark:text-dark-text-primary">
                    #{activity.id.substring(0, 8)}
                  </td>
                  <td className="py-3 text-sm text-light-text-primary dark:text-dark-text-primary">
                    {activity.type}
                  </td>
                  <td className="py-3">
                    <Badge variant={getStatusVariant(activity.status)}>
                      {activity.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {formatDate(activity.created)}
                  </td>
                  <td className="py-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {activity.duration ? `${activity.duration}s` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
