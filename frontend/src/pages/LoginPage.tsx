import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/Auth/LoginForm';
import { DemoAccountSelector } from '../components/Auth/DemoAccountSelector';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Common/Card';

export const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [_demoUsername, setDemoUsername] = useState('');
  const [_demoPassword, setDemoPassword] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDemoSelect = (username: string, password: string) => {
    // Pre-fill the form (you'd need to pass these to LoginForm)
    setDemoUsername(username);
    setDemoPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-secondary p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Sovereign AI</h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            On-Premise Agentic AI Workbench
          </p>
        </div>

        <LoginForm />

        <DemoAccountSelector onSelect={handleDemoSelect} />

        <div className="mt-6 text-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
          <p>🔒 100% On-Premise • No External Calls • Sovereign AI</p>
        </div>
      </Card>
    </div>
  );
};
