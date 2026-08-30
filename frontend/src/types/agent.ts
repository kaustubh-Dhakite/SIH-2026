export interface Agent {
  id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  default_model: string;
  tools: string[];
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  agent_id: string;
  user_id: string;
  input_query: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled';
  result?: string;
  deliverable_url?: string;
  trace: TraceStep[];
  model_used?: string;
  duration_seconds?: number;
  created_at: string;
  completed_at?: string;
}

export interface TraceStep {
  step: number;
  action: string;
  status: 'running' | 'completed' | 'failed';
  duration?: number;
  details?: Record<string, any>;
  timestamp: string;
}

export interface TaskQueryRequest {
  query: string;
  kb_ids?: string[];
  options?: Record<string, any>;
}
