import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { Toast } from './components/Common/Toast';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AgentWorkspacePage } from './pages/AgentWorkspacePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ModelsPage } from './pages/ModelsPage';
import { MultimodalPage } from './pages/MultimodalPage';
import { ToolsPage } from './pages/ToolsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SecurityCenterPage } from './pages/SecurityCenterPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toast />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/agents"
            element={
              <ProtectedRoute requiredRoles={['admin', 'operator', 'analyst']}>
                <AgentWorkspacePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/knowledge-base"
            element={
              <ProtectedRoute requiredRoles={['admin', 'operator', 'analyst']}>
                <KnowledgeBasePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/models"
            element={
              <ProtectedRoute>
                <ModelsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/multimodal"
            element={
              <ProtectedRoute requiredRoles={['admin', 'operator', 'analyst']}>
                <MultimodalPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tools"
            element={
              <ProtectedRoute requiredRoles={['admin', 'operator', 'analyst']}>
                <ToolsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/security"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <SecurityCenterPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
