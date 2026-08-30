import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { Play, Download, Copy, CheckCircle, Loader } from 'lucide-react';
import { agentService } from '../services/agents';
import { knowledgeService } from '../services/knowledge';
import { useToast } from '../hooks/useToast';
import { Agent, Task, KnowledgeBase } from '../types';
import { exportToDocx } from '../utils/export';
import { formatDuration } from '../utils/format';

import { Modal } from '../components/Common/Modal';
import { Input } from '../components/Common/Input';
import { Plus } from 'lucide-react';

export const AgentWorkspacePage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedKbs, setSelectedKbs] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [task, setTask] = useState<Task | null>(null);
  const [polling, setPolling] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    system_prompt: 'You are a helpful AI assistant.',
    default_model: 'llama3.2:1b',
    tools: ['rag', 'code_sandbox', 'file_ops', 'ocr']
  });
  
  const toast = useToast();

  useEffect(() => {
    fetchAgents();
    fetchKnowledgeBases();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (polling && task) {
      interval = setInterval(async () => {
        try {
          const updatedTask = await agentService.getTask(task.agent_id, task.id);
          setTask(updatedTask);
          
          if (updatedTask.status === 'completed' || updatedTask.status === 'failed') {
            setPolling(false);
          }
        } catch (error) {
          console.error('Failed to poll task:', error);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [polling, task]);

  const fetchAgents = async () => {
    try {
      const data = await agentService.listAgents();
      setAgents(data);
      if (data.length > 0) {
        setSelectedAgent(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch agents');
    }
  };

  const fetchKnowledgeBases = async () => {
    try {
      const data = await knowledgeService.listKnowledgeBases();
      setKbs(data);
    } catch (error) {
      toast.error('Failed to fetch knowledge bases');
    }
  };

  const handleCreateAgent = async () => {
    if (!newAgent.name) {
      toast.error('Please enter an agent name');
      return;
    }
    try {
      const created = await agentService.createAgent(newAgent);
      setAgents([...agents, created]);
      setSelectedAgent(created.id);
      setShowCreateModal(false);
      setNewAgent({ ...newAgent, name: '', description: '' });
      toast.success('Agent created successfully');
    } catch (error) {
      toast.error('Failed to create agent');
    }
  };

  const handleExecute = async () => {
    if (!selectedAgent || !query.trim()) {
      toast.error('Please select an agent and enter a query');
      return;
    }

    try {
      const result = await agentService.queryAgent(selectedAgent, {
        query,
        kb_ids: selectedKbs,
      });
      
      const initialTask = await agentService.getTask(selectedAgent, result.task_id);
      setTask(initialTask);
      setPolling(true);
      toast.success('Task started successfully');
    } catch (error) {
      toast.error('Failed to start task');
    }
  };

  const handleExportDocx = async () => {
    if (!task || !task.result) return;

    try {
      const citations = task.trace
        .filter(t => t.action === 'Retrieving knowledge' && t.details)
        .flatMap(t => t.details?.results || []);

      await exportToDocx(
        `Agent Task ${task.id.substring(0, 8)}`,
        task.result,
        citations
      );
      toast.success('Document exported successfully');
    } catch (error) {
      toast.error('Failed to export document');
    }
  };

  const handleCopy = () => {
    if (task?.result) {
      navigator.clipboard.writeText(task.result);
      toast.success('Result copied to clipboard');
    }
  };

  const agent = agents.find(a => a.id === selectedAgent);

  const getTraceIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-success" />;
      case 'running':
        return <Loader size={20} className="text-info animate-spin" />;
      case 'failed':
        return <CheckCircle size={20} className="text-error" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Agent Workspace
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Execute AI agents with real-time trace monitoring
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={20} className="mr-2" />
            Create Agent
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Configuration */}
          <div className="col-span-5 space-y-6">
            <Card title="Agent Configuration">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    Select Agent
                  </label>
                  <select
                    value={selectedAgent || ''}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                {agent && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                        System Prompt
                      </label>
                      <textarea
                        value={agent.system_prompt || ''}
                        readOnly
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-secondary dark:text-dark-text-secondary text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                        Model
                      </label>
                      <Badge variant="info">{agent.default_model}</Badge>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                        Tools
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {agent.tools.map((tool) => (
                          <Badge key={tool}>{tool}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    Knowledge Bases (Optional)
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {kbs.map((kb) => (
                      <label key={kb.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedKbs.includes(kb.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedKbs([...selectedKbs, kb.id]);
                            } else {
                              setSelectedKbs(selectedKbs.filter(id => id !== kb.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-light-text-primary dark:text-dark-text-primary">
                          {kb.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Task Input">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    Query
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={6}
                    placeholder="Enter your task query..."
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary dark:placeholder-dark-text-secondary"
                  />
                </div>
                <Button
                  onClick={handleExecute}
                  className="w-full"
                  disabled={polling || !query.trim()}
                >
                  <Play size={20} className="mr-2" />
                  {polling ? 'Executing...' : 'Execute Task'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Panel - Execution & Results */}
          <div className="col-span-7 space-y-6">
            {task && (
              <>
                {/* Execution Trace */}
                <Card title="Execution Trace">
                  {task.trace.length === 0 ? (
                    <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
                      Waiting for execution...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {task.trace.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg"
                        >
                          {getTraceIcon(step.status)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Step {step.step}: {step.action}
                              </span>
                              {step.duration && (
                                <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                  {formatDuration(step.duration)}
                                </span>
                              )}
                            </div>
                            {step.status === 'running' && (
                              <div className="mt-2 h-1 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded overflow-hidden">
                                <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Results */}
                {task.status === 'completed' && task.result && (
                  <Card 
                    title="Results"
                    actions={
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={handleCopy}>
                          <Copy size={16} className="mr-1" />
                          Copy
                        </Button>
                        <Button size="sm" onClick={handleExportDocx}>
                          <Download size={16} className="mr-1" />
                          Export DOCX
                        </Button>
                      </div>
                    }
                  >
                    <div className="prose max-w-none">
                      <div className="p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                        <p className="text-sm text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap">
                          {task.result}
                        </p>
                      </div>
                    </div>

                    {task.duration_seconds && (
                      <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-light-text-secondary dark:text-dark-text-secondary">
                            Execution Time
                          </span>
                          <Badge variant="info">
                            {formatDuration(task.duration_seconds)}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {task.status === 'failed' && (
                  <Card title="Error">
                    <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                      <p className="text-sm text-error">
                        {task.result || 'Task execution failed'}
                      </p>
                    </div>
                  </Card>
                )}
              </>
            )}

            {!task && (
              <Card>
                <div className="text-center py-16 text-light-text-secondary dark:text-dark-text-secondary">
                  <p className="text-lg mb-2">Ready to Execute</p>
                  <p className="text-sm">Configure your agent and enter a query to begin</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Agent"
      >
        <div className="space-y-4">
          <Input
            label="Agent Name"
            value={newAgent.name}
            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            placeholder="e.g., Data Analyst"
          />
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
              Description
            </label>
            <textarea
              value={newAgent.description}
              onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
              className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
              System Prompt
            </label>
            <textarea
              value={newAgent.system_prompt}
              onChange={(e) => setNewAgent({ ...newAgent, system_prompt: e.target.value })}
              className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary font-mono text-sm"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
              Model
            </label>
            <Input
              value={newAgent.default_model}
              onChange={(e) => setNewAgent({ ...newAgent, default_model: e.target.value })}
              placeholder="e.g., llama3.2:1b"
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAgent}>Create</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
