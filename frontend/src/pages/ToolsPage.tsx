import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { Modal } from '../components/Common/Modal';
import { Wrench, Play } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

interface Tool {
  name: string;
  id: string;
  description: string;
  status: string;
  last_used: string | null;
}

export const ToolsPage: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testing, setTesting] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await api.get('/api/tools');
      setTools(response.data.tools);
    } catch (error) {
      toast.error('Failed to fetch tools');
    }
  };

  const handleTest = async () => {
    if (!selectedTool) return;

    setTesting(true);
    try {
      const response = await api.post(`/api/tools/${selectedTool.id}/test`, {
        input: testInput,
      });
      setTestOutput(response.data.output);
      toast.success('Test completed');
    } catch (error) {
      toast.error('Test failed');
    } finally {
      setTesting(false);
    }
  };

  const openTestModal = (tool: Tool) => {
    setSelectedTool(tool);
    setTestInput('');
    setTestOutput('');
    setShowTestModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Tools
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Agent tools and capabilities
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-secondary/10 rounded-lg">
                      <Wrench size={24} className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {tool.name}
                      </h3>
                    </div>
                  </div>
                  <Badge variant={tool.status === 'ready' ? 'success' : 'default'}>
                    {tool.status}
                  </Badge>
                </div>

                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {tool.description}
                </p>

                {tool.last_used && (
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    Last used: {tool.last_used}
                  </p>
                )}

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => openTestModal(tool)}
                >
                  <Play size={16} className="mr-2" />
                  Test Tool
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Test Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title={`Test ${selectedTool?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
              Input
            </label>
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              rows={4}
              placeholder="Enter test input..."
              className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
            />
          </div>

          {testOutput && (
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Output
              </label>
              <div className="p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                <pre className="text-sm text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap">
                  {testOutput}
                </pre>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowTestModal(false)}>
              Close
            </Button>
            <Button onClick={handleTest} disabled={testing}>
              {testing ? 'Testing...' : 'Run Test'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
