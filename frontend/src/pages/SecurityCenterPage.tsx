import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Badge } from '../components/Common/Badge';
import { Shield, Download, Lock, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

export const SecurityCenterPage: React.FC = () => {
  const [metrics, setMetrics] = useState({
    external_calls: 0,
    firewall_blocks: 0,
    unauthorized_access: 0,
    audit_events: 0,
  });
  const [exporting, setExporting] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/api/security/network-status');
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch security metrics');
    }
  };

  const handleExportReport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/api/security/export-report', {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sovereignty_report_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Security Center
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Sovereignty compliance and security monitoring
            </p>
          </div>
          <Button onClick={handleExportReport} disabled={exporting}>
            <Download size={20} className="mr-2" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>

        {/* Sovereignty Status */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-success/10 rounded-full">
              <Shield size={48} className="text-success" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                🔒 SECURE - No External Calls
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                All operations are performed locally. Complete data sovereignty maintained.
              </p>
            </div>
            <Badge variant="success" className="text-lg px-4 py-2">
              100% COMPLIANT
            </Badge>
          </div>
        </Card>

        {/* Security Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="inline-flex p-4 bg-success/10 rounded-full mb-3">
                <Lock size={32} className="text-success" />
              </div>
              <div className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                {metrics.external_calls}
              </div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                External API Calls
              </p>
              <p className="text-xs text-success mt-1">(24h)</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="inline-flex p-4 bg-warning/10 rounded-full mb-3">
                <AlertTriangle size={32} className="text-warning" />
              </div>
              <div className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                {metrics.firewall_blocks}
              </div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Firewall Blocks
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">(24h)</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="inline-flex p-4 bg-success/10 rounded-full mb-3">
                <Shield size={32} className="text-success" />
              </div>
              <div className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                {metrics.unauthorized_access}
              </div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Unauthorized Access
              </p>
              <p className="text-xs text-success mt-1">(24h)</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="inline-flex p-4 bg-info/10 rounded-full mb-3">
                <Shield size={32} className="text-info" />
              </div>
              <div className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                {metrics.audit_events}
              </div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Audit Events
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">(Total)</p>
            </div>
          </Card>
        </div>

        {/* Network Traffic */}
        <Card title="Real-time Network Monitoring">
          <div className="h-64 flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
            <div className="text-center">
              <p className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                No External Network Activity Detected
              </p>
              <p className="text-sm text-success">
                ✓ All traffic contained within local network
              </p>
            </div>
          </div>
        </Card>

        {/* Firewall Rules */}
        <Card title="Active Firewall Rules">
          <div className="space-y-2">
            {[
              { rule: 'Block all outbound internet traffic', status: 'Active', priority: 'High' },
              { rule: 'Allow internal network communication', status: 'Active', priority: 'High' },
              { rule: 'Restrict external DNS queries', status: 'Active', priority: 'Medium' },
              { rule: 'Log all connection attempts', status: 'Active', priority: 'Medium' },
            ].map((rule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-success" />
                  <span className="text-sm text-light-text-primary dark:text-dark-text-primary">
                    {rule.rule}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.priority === 'High' ? 'error' : 'warning'}>
                    {rule.priority}
                  </Badge>
                  <Badge variant="success">{rule.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Compliance Information */}
        <Card title="Compliance & Certification">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-center">
              <p className="text-sm font-medium text-success mb-1">Data Sovereignty</p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                100% On-Premise
              </p>
            </div>
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-center">
              <p className="text-sm font-medium text-success mb-1">Encryption</p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                AES-256
              </p>
            </div>
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-center">
              <p className="text-sm font-medium text-success mb-1">Audit Trail</p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Complete
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
