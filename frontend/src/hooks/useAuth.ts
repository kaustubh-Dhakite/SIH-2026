import { useEffect } from 'react';
import { useAuthStore } from '../store';
import { authService } from '../services/auth';

export const useAuth = () => {
  const { user, setUser, logout } = useAuthStore();

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, [setUser]);

  return {
    user,
    isAuthenticated: !!user,
    logout,
  };
};
