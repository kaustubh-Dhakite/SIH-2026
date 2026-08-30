import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { Spinner } from '../components/Common/Spinner';
import { Search, Grid, List, File } from 'lucide-react';
import { knowledgeService } from '../services/knowledge';
import { useToast } from '../hooks/useToast';
import { Document, KnowledgeBase } from '../types';
import { formatDate, formatFileSize } from '../utils/format';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKb, setSelectedKb] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsData, kbsData] = await Promise.all([
        knowledgeService.listDocuments(),
        knowledgeService.listKnowledgeBases(),
      ]);
      setDocuments(docsData);
      setKbs(kbsData);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await knowledgeService.deleteDocument(docId);
      setDocuments(documents.filter(d => d.id !== docId));
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKb = selectedKb === 'all' || doc.kb_id === selectedKb;
    const matchesType = selectedType === 'all' || doc.file_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    
    return matchesSearch && matchesKb && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'indexed':
        return <Badge variant="success">Indexed</Badge>;
      case 'processing':
        return <Badge variant="info">Processing</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getKbName = (kbId: string) => {
    return kbs.find(kb => kb.id === kbId)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Documents
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Browse and manage all documents across collections
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List size={20} />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid size={20} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Collection
              </label>
              <select
                value={selectedKb}
                onChange={(e) => setSelectedKb(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
              >
                <option value="all">All Collections</option>
                {kbs.map((kb) => (
                  <option key={kb.id} value={kb.id}>
                    {kb.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="txt">TXT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
              >
                <option value="all">All Status</option>
                <option value="indexed">Indexed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card>
          <div className="mb-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Showing {filteredDocuments.length} of {documents.length} documents
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-16 text-light-text-secondary dark:text-dark-text-secondary">
              No documents found
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-light-border dark:border-dark-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Name
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Collection
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Type
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Size
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Chunks
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Uploaded
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b border-light-border dark:border-dark-border hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <File size={16} className="text-light-text-secondary dark:text-dark-text-secondary" />
                          <span className="text-sm text-light-text-primary dark:text-dark-text-primary">
                            {doc.filename}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {getKbName(doc.kb_id)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary uppercase">
                          {doc.file_type}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {doc.size_bytes ? formatFileSize(doc.size_bytes) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {doc.chunks_count}
                        </span>
                      </td>
                      <td className="py-3 px-2">{getStatusBadge(doc.status)}</td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {formatDate(doc.created_at)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(doc.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 border border-light-border dark:border-dark-border rounded-lg hover:shadow-medium transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <File size={32} className="text-primary" />
                    {getStatusBadge(doc.status)}
                  </div>
                  <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1 truncate">
                    {doc.filename}
                  </h3>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    {getKbName(doc.kb_id)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary mb-3">
                    <span>{doc.size_bytes ? formatFileSize(doc.size_bytes) : '-'}</span>
                    <span>{doc.chunks_count} chunks</span>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    className="w-full"
                    onClick={() => handleDelete(doc.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
