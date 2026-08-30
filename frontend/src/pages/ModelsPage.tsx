import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { Modal } from '../components/Common/Modal';
import { Cpu, CheckCircle, Loader, XCircle, Info } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';

interface Model {
  name: string;
  id: string;
  type: string;
  parameters: string;
  vram: string;
  status: string;
  description: string;
}

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [_loading, setLoading] = useState(true);
  
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await api.get('/api/models');
      setModels(response.data.models);
      setCurrentModel(response.data.current);
    } catch (error) {
      toast.error('Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchModel = async (modelId: string) => {
    if (!user || !['admin', 'operator'].includes(user.role)) {
      toast.error('You do not have permission to switch models');
      return;
    }

    try {
      await api.post(`/api/models/switch?model_name=${modelId}`);
      setCurrentModel(modelId);
      toast.success('Model switched successfully');
    } catch (error) {
      toast.error('Failed to switch model');
    }
  };

  const handleShowInfo = (model: Model) => {
    setSelectedModel(model);
    setShowInfoModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle size={20} className="text-success" />;
      case 'loading':
        return <Loader size={20} className="text-info animate-spin" />;
      case 'error':
        return <XCircle size={20} className="text-error" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'general':
        return 'bg-primary/10 text-primary';
      case 'code':
        return 'bg-success/10 text-success';
      case 'multimodal':
        return 'bg-warning/10 text-warning';
      case 'embeddings':
        return 'bg-info/10 text-info';
      default:
        return 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary';
    }
  };

  const canSwitch = user && ['admin', 'operator'].includes(user.role);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Models
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Manage AI models and configurations
          </p>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Current Active Model
              </p>
              <p className="text-lg font-semibold text-primary mt-1">
                {models.find(m => m.id === currentModel)?.name || currentModel}
              </p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {models.map((model) => (
            <Card key={model.id}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Cpu size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {model.name}
                      </h3>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {model.id}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(model.status)}
                </div>

                {/* Type Badge */}
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(model.type)}`}>
                    {model.type}
                  </span>
                </div>

                {/* Specs */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Parameters
                    </span>
                    <span className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      {model.parameters}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      VRAM
                    </span>
                    <span className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      {model.vram}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Status
                    </span>
                    <Badge variant={model.status === 'ready' ? 'success' : 'default'}>
                      {model.status}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {model.description}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-light-border dark:border-dark-border">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={currentModel === model.id || !canSwitch}
                    onClick={() => handleSwitchModel(model.id)}
                  >
                    {currentModel === model.id ? 'Active' : 'Select'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleShowInfo(model)}
                  >
                    <Info size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!canSwitch && (
          <Card>
            <div className="text-center py-4">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                You do not have permission to switch models. Contact an administrator.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Model Info Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Model Information"
        size="lg"
      >
        {selectedModel && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <Cpu size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {selectedModel.name}
                </h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {selectedModel.id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Type
                </p>
                <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                  {selectedModel.type}
                </p>
              </div>
              <div className="p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Parameters
                </p>
                <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                  {selectedModel.parameters}
                </p>
              </div>
              <div className="p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  VRAM Required
                </p>
                <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                  {selectedModel.vram}
                </p>
              </div>
              <div className="p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Status
                </p>
                <Badge variant={selectedModel.status === 'ready' ? 'success' : 'default'}>
                  {selectedModel.status}
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Description
              </p>
              <p className="text-sm text-light-text-primary dark:text-dark-text-primary">
                {selectedModel.description}
              </p>
            </div>

            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <p className="text-sm text-info">
                💡 This model is optimized for {selectedModel.type.toLowerCase()} tasks
                and runs entirely on-premise with no external dependencies.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowInfoModal(false)}>
                Close
              </Button>
              {canSwitch && currentModel !== selectedModel.id && (
                <Button onClick={() => {
                  handleSwitchModel(selectedModel.id);
                  setShowInfoModal(false);
                }}>
                  Switch to This Model
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
