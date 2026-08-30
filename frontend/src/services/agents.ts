import api from './api';
import { Agent, Task, TaskQueryRequest } from '../types';

export const agentService = {
  async listAgents(): Promise<Agent[]> {
    const response = await api.get<Agent[]>('/api/agents');
    return response.data;
  },

  async getAgent(id: string): Promise<Agent> {
    const response = await api.get<Agent>(`/api/agents/${id}`);
    return response.data;
  },

  async createAgent(data: Partial<Agent>): Promise<Agent> {
    const response = await api.post<Agent>('/api/agents', data);
    return response.data;
  },

  async queryAgent(agentId: string, request: TaskQueryRequest): Promise<{ task_id: string; status: string }> {
    const response = await api.post(`/api/agents/${agentId}/query`, request);
    return response.data;
  },

  async getTask(agentId: string, taskId: string): Promise<Task> {
    const response = await api.get<Task>(`/api/agents/${agentId}/task/${taskId}`);
    return response.data;
  },

  async cancelTask(agentId: string, taskId: string): Promise<void> {
    await api.post(`/api/agents/${agentId}/task/${taskId}/cancel`);
  },
};
