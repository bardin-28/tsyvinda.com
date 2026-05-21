import type { User } from '@/shared/contexts/UserContext';
import { API } from '@/api';

export type LoginCredentials = {
  email: string;
  password: string;
};

export function login(credentials: LoginCredentials): Promise<User> {
  return API.post<User>('/auth/login', credentials);
}

export function logout(): Promise<void> {
  return API.post<void>('/auth/logout');
}
