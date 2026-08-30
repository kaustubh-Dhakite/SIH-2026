import api from './api';
import { LoginCredentials, TokenResponse, User } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/api/auth/login', credentials);
    const { access_token, user } = response.data;
    
    // Store token and user
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  async register(data: { username: string; password: string; email?: string; role?: string }): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/api/auth/register', data);
    const { access_token, user } = response.data;
    
    // Store token and user
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
