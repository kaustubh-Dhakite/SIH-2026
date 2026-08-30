import React, { useEffect, useState } from 'react';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

interface HealthStatus {
  status: string;
  services: {
    database: string;
    ollama: string;
    qdrant: string;
    ocr: string;
  };
}

export const SystemHealth: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await api.get('/api/health');
        setHealth(response.data);
      } catch (error) {
        console.error('Failed to fetch health:', error);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // Refresh every 5s

    return () => clearInterval(interval);
  }, []);

  const services = health ? [
    { name: 'Database', status: health.services.database },
    { name: 'Ollama', status: health.services.ollama },
    { name: 'Qdrant', status: health.services.qdrant },
    { name: 'OCR', status: health.services.ocr },
  ] : [];

  return (
    <Card title="System Health">
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg"
          >
            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
              {service.name}
            </span>
            {service.status === 'healthy' ? (
              <CheckCircle size={20} className="text-success" />
            ) : (
              <XCircle size={20} className="text-error" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Active Model
          </span>
          <Badge variant="info">Qwen3-8B</Badge>
        </div>
      </div>
    </Card>
  );
};
