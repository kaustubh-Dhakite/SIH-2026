export type Role = 'admin' | 'operator' | 'analyst' | 'viewer';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
