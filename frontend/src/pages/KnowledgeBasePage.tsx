import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Modal } from '../components/Common/Modal';
import { Input } from '../components/Common/Input';
import { Badge } from '../components/Common/Badge';
import { Spinner } from '../components/Common/Spinner';
import { Plus, Upload, FolderOpen, File } from 'lucide-react';
import { knowledgeService } from '../services/knowledge';
import { useToast } from '../hooks/useToast';
import { KnowledgeBase, Document } from '../types';
import { formatDate, formatFileSize } from '../utils/format';

export const KnowledgeBasePage: React.FC = () => {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedKb, setSelectedKb] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newKbName, setNewKbName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const toast = useToast();

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  useEffect(() => {
    if (selectedKb) {
      fetchDocuments(selectedKb);
    }
  }, [selectedKb]);

  const fetchKnowledgeBases = async () => {
    try {
      const data = await knowledgeService.listKnowledgeBases();
      setKbs(data);
      if (data.length > 0 && !selectedKb) {
        setSelectedKb(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch knowledge bases');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (kbId: string) => {
    try {
      const data = await knowledgeService.listDocuments(kbId);
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    }
  };

  const handleCreateKb = async () => {
    if (!newKbName.trim()) {
      toast.error('Please enter a knowledge base name');
      return;
    }

    try {
      const newKb = await knowledgeService.createKnowledgeBase({
        name: newKbName,
        classification: 'public',
      });
      setKbs([...kbs, newKb]);
      setNewKbName('');
      setShowCreateModal(false);
      toast.success('Knowledge base created successfully');
    } catch (error) {
      toast.error('Failed to create knowledge base');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedKb) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      await knowledgeService.uploadDocument(selectedKb, selectedFile);
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      setShowUploadModal(false);
      fetchDocuments(selectedKb);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await knowledgeService.deleteDocument(docId);
      toast.success('Document deleted successfully');
      if (selectedKb) fetchDocuments(selectedKb);
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

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
              Knowledge Base
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Manage document collections and semantic search
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={20} className="mr-2" />
              New Collection
            </Button>
            <Button variant="secondary" onClick={() => setShowUploadModal(true)} disabled={!selectedKb}>
              <Upload size={20} className="mr-2" />
              Upload Document
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Collections List */}
          <div className="col-span-3">
            <Card title="Collections">
              {kbs.length === 0 ? (
                <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary text-sm">
                  No collections yet
                </div>
              ) : (
                <div className="space-y-2">
                  {kbs.map((kb) => (
                    <button
                      key={kb.id}
                      onClick={() => setSelectedKb(kb.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedKb === kb.id
                          ? 'bg-primary text-white'
                          : 'bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen size={16} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{kb.name}</p>
                          <p className="text-xs opacity-80">
                            {kb.document_count} documents
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Documents List */}
          <div className="col-span-9">
            <Card 
              title={selectedKb ? kbs.find(k => k.id === selectedKb)?.name : 'Select a collection'}
              actions={
                selectedKb && (
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {documents.length} documents
                  </span>
                )
              }
            >
              {!selectedKb ? (
                <div className="text-center py-16 text-light-text-secondary dark:text-dark-text-secondary">
                  Select a collection to view documents
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-16 text-light-text-secondary dark:text-dark-text-secondary">
                  <p className="mb-4">No documents in this collection</p>
                  <Button variant="secondary" onClick={() => setShowUploadModal(true)}>
                    <Upload size={20} className="mr-2" />
                    Upload First Document
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-light-border dark:border-dark-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                          Name
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
                      {documents.map((doc) => (
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
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Create KB Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Knowledge Base"
      >
        <div className="space-y-4">
          <Input
            label="Collection Name"
            value={newKbName}
            onChange={(e) => setNewKbName(e.target.value)}
            placeholder="Enter collection name"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKb}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
              Select File
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
            />
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Supported formats: PDF, DOCX, TXT, PNG, JPG, WEBP (max 100MB)
            </p>
          </div>
          {selectedFile && (
            <div className="p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
              <p className="text-sm text-light-text-primary dark:text-dark-text-primary">
                {selectedFile.name}
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
