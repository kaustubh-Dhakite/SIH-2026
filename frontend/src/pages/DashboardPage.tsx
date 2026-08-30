import React from 'react';
import { Layout } from '../components/Layout/Layout';
import { SystemHealth } from '../components/Dashboard/SystemHealth';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { RecentActivity } from '../components/Dashboard/RecentActivity';

export const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Dashboard
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Overview of your AI workbench
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SystemHealth />
          <QuickActions />
        </div>

        <RecentActivity />
      </div>
    </Layout>
  );
};
