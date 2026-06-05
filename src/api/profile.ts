import type { User } from '@/shared/contexts/UserContext';
import { API } from '@/api';
import { TURNSTILE_TOKEN_FIELD } from '@/shared/turnstile';

export function getProfile(): Promise<User> {
  return API.get<User>('/profile');
}

export function updateProfile(form: FormData, turnstileToken: string): Promise<User> {
  form.append(TURNSTILE_TOKEN_FIELD, turnstileToken);
  return API.patch<User>('/profile', form);
}
