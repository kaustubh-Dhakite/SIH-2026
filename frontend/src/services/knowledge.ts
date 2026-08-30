import api from './api';
import { KnowledgeBase, Document, RAGResult } from '../types';

export const knowledgeService = {
  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    const response = await api.get<KnowledgeBase[]>('/api/knowledge-bases');
    return response.data;
  },

  async createKnowledgeBase(data: { name: string; classification?: string }): Promise<KnowledgeBase> {
    const response = await api.post<KnowledgeBase>('/api/knowledge-bases', data);
    return response.data;
  },

  async uploadDocument(kbId: string, file: File): Promise<{ doc_id: string; status: string }> {
    const formData = new FormData();
    formData.append('kb_id', kbId);
    formData.append('file', file);

    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async listDocuments(kbId?: string): Promise<Document[]> {
    const params = kbId ? { kb_id: kbId } : {};
    const response = await api.get<Document[]>('/api/documents', { params });
    return response.data;
  },

  async deleteDocument(docId: string): Promise<void> {
    await api.delete(`/api/documents/${docId}`);
  },

  async ragQuery(query: string, kbIds?: string[]): Promise<{ results: RAGResult[]; query: string }> {
    const response = await api.post('/api/rag/query', {
      query,
      kb_ids: kbIds,
      top_k: 5,
      score_threshold: 0.7,
    });
    return response.data;
  },
};
