import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { Plus, Upload, Play } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Create Agent',
      icon: Plus,
      onClick: () => navigate('/agents'),
      variant: 'primary' as const,
    },
    {
      label: 'Upload Document',
      icon: Upload,
      onClick: () => navigate('/knowledge-base'),
      variant: 'secondary' as const,
    },
    {
      label: 'Run Task',
      icon: Play,
      onClick: () => navigate('/agents'),
      variant: 'primary' as const,
    },
  ];

  return (
    <Card title="Quick Actions">
      <div className="grid grid-cols-3 gap-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <action.icon size={24} />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};
