import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { Spinner } from '../components/Common/Spinner';
import { Search } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/format';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  status: string;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const toast = useToast();

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, statusFilter]);

  const fetchLogs = async () => {
    try {
      const params: any = { page, page_size: 50 };
      if (actionFilter !== 'all') params.action = actionFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await api.get('/api/audit-logs', { params });
      setLogs(response.data.logs);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resource_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === 'success' ? (
      <Badge variant="success">Success</Badge>
    ) : (
      <Badge variant="error">Failure</Badge>
    );
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
        <div>
          <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Audit Logs
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Complete activity history and security audit trail
          </p>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-3 gap-4">
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
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Action
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
              >
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="create_agent">Create Agent</option>
                <option value="upload_document">Upload Document</option>
                <option value="execute_task">Execute Task</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Logs Table */}
        <Card>
          <div className="mb-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Showing {filteredLogs.length} of {total} logs
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Action
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Resource
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-light-border dark:border-dark-border hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary"
                  >
                    <td className="py-3 px-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-3 px-2 text-sm text-light-text-primary dark:text-dark-text-primary">
                      {log.action}
                    </td>
                    <td className="py-3 px-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {log.resource_type || '-'} {log.resource_id && `(${log.resource_id.substring(0, 8)})`}
                    </td>
                    <td className="py-3 px-2">{getStatusBadge(log.status)}</td>
                    <td className="py-3 px-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-light-border dark:border-dark-border">
            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Page {page} of {Math.ceil(total / 50)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-light-bg-tertiary dark:bg-dark-bg-tertiary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 50)}
                className="px-3 py-1 rounded bg-light-bg-tertiary dark:bg-dark-bg-tertiary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
