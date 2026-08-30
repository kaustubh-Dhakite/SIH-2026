import React, { useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Image as ImageIcon, Download } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

export const MultimodalPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [taskType, setTaskType] = useState<string>('image_description');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const toast = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('task_type', taskType);

      const response = await api.post('/api/multimodal/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data.analysis);
      toast.success('Analysis completed');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const text = `Image Analysis\n\nTask Type: ${taskType}\n\nResults:\n${result}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Multimodal Analysis
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Analyze images with AI vision models
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left - Upload & Config */}
          <div className="space-y-6">
            <Card title="Upload Image">
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-light-border dark:border-dark-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  ) : (
                    <div className="py-8">
                      <ImageIcon size={48} className="mx-auto text-light-text-secondary dark:text-dark-text-secondary mb-4" />
                      <p className="text-light-text-primary dark:text-dark-text-primary mb-2">
                        Click to upload image
                      </p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        PNG, JPG, JPEG (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </Card>

            <Card title="Analysis Settings">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    Task Type
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
                  >
                    <option value="image_description">Image Description</option>
                    <option value="ocr">OCR (Text Extraction)</option>
                    <option value="code_analysis">Code Analysis</option>
                  </select>
                </div>

                <Button
                  onClick={handleAnalyze}
                  className="w-full"
                  disabled={!selectedFile || loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze Image'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right - Results */}
          <Card 
            title="Analysis Results"
            actions={
              result && (
                <Button size="sm" onClick={handleExport}>
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              )
            }
          >
            {result ? (
              <div className="p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                <p className="text-sm text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap">
                  {result}
                </p>
              </div>
            ) : (
              <div className="text-center py-16 text-light-text-secondary dark:text-dark-text-secondary">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p>Upload an image and click analyze to see results</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};
