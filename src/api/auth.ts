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

export type PasswordResetMessage = {
  message: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
};

/**
 * Request a password reset email. The backend always responds with the same
 * generic 200 message whether or not the address is registered, so the caller
 * must not infer account existence from the result.
 */
export function requestPasswordReset(email: string): Promise<PasswordResetMessage> {
  return API.post<PasswordResetMessage>('/auth/forgot-password', { email });
}

/**
 * Set a new password using the opaque token delivered in the reset email.
 * The backend validates the token and returns 400 when it is invalid or expired.
 */
export function resetPassword(payload: ResetPasswordPayload): Promise<PasswordResetMessage> {
  return API.post<PasswordResetMessage>('/auth/reset-password', payload);
}
