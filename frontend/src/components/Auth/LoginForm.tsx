import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Common/Button';
import { Input } from '../Common/Input';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store';
import { useToast } from '../../hooks/useToast';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ username, password });
      setUser(response.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        required
      />
      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          className="rounded border-light-border dark:border-dark-border"
        />
        <label
          htmlFor="remember"
          className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary"
        >
          Remember me
        </label>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};
