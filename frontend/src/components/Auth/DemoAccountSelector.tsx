import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../Common/Button';

interface DemoAccount {
  username: string;
  password: string;
  role: string;
  description: string;
}

const demoAccounts: DemoAccount[] = [
  { username: 'admin', password: 'demo123', role: 'Admin', description: 'Full access to all features' },
  { username: 'operator', password: 'demo123', role: 'Operator', description: 'Manage agents, KB, models' },
  { username: 'analyst', password: 'demo123', role: 'Analyst', description: 'Create tasks, upload docs' },
  { username: 'viewer', password: 'demo123', role: 'Viewer', description: 'Read-only access' },
];

interface DemoAccountSelectorProps {
  onSelect: (username: string, password: string) => void;
}

export const DemoAccountSelector: React.FC<DemoAccountSelectorProps> = ({ onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
      >
        <span>Demo Accounts</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 p-4 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg">
          {demoAccounts.map((account) => (
            <div
              key={account.username}
              className="flex items-center justify-between p-3 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg"
            >
              <div>
                <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                  {account.role}
                </p>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {account.description}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onSelect(account.username, account.password)}
              >
                Use
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
