export interface KnowledgeBase {
  id: string;
  name: string;
  classification?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  document_count: number;
}

export interface Document {
  id: string;
  kb_id: string;
  filename: string;
  file_path?: string;
  file_type?: string;
  size_bytes?: number;
  chunks_count: number;
  status: 'processing' | 'indexed' | 'failed';
  indexed_at?: string;
  created_at: string;
  created_by: string;
}

export interface RAGResult {
  text: string;
  source: string;
  score: number;
  metadata?: Record<string, any>;
}
