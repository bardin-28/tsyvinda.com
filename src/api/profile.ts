import type { User } from '@/shared/contexts/UserContext';
import { API } from '@/api';

export function getProfile(): Promise<User> {
  return API.get<User>('/profile');
}

export function updateProfile(form: FormData): Promise<User> {
  return API.patch<User>('/profile', form);
}
