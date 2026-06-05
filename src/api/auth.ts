import type { User } from '@/shared/contexts/UserContext';
import { API } from '@/api';
import { TURNSTILE_TOKEN_FIELD } from '@/shared/turnstile';

export type LoginCredentials = {
  email: string;
  password: string;
};

export function login(credentials: LoginCredentials, turnstileToken: string): Promise<User> {
  return API.post<User>('/auth/login', {
    ...credentials,
    [TURNSTILE_TOKEN_FIELD]: turnstileToken,
  });
}

export function logout(): Promise<void> {
  return API.post<void>('/auth/logout');
}

export type PasswordResetMessage = {
  message: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

/**
 * Register a new account. On success the backend emails a verification link and
 * responds with 201 + a generic message — it does NOT establish a session, so
 * the caller must not treat this as a login. Returns 409 when the email is
 * already registered.
 */
export function register(
  payload: RegisterPayload,
  turnstileToken: string,
): Promise<PasswordResetMessage> {
  return API.post<PasswordResetMessage>('/auth/register', {
    ...payload,
    [TURNSTILE_TOKEN_FIELD]: turnstileToken,
  });
}

/**
 * Confirm a newly registered email using the opaque token from the verification
 * link (`/registration?token=…`). The backend validates the token and returns
 * 400 when it is invalid, already used, or expired.
 */
export function confirmEmail(token: string): Promise<PasswordResetMessage> {
  return API.post<PasswordResetMessage>('/auth/confirm-email', { token });
}

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
export function requestPasswordReset(
  email: string,
  turnstileToken: string,
): Promise<PasswordResetMessage> {
  return API.post<PasswordResetMessage>('/auth/forgot-password', {
    email,
    [TURNSTILE_TOKEN_FIELD]: turnstileToken,
  });
}

/**
 * Set a new password using the opaque token delivered in the reset email.
 * The backend validates the token and returns 400 when it is invalid or expired.
 */
export function resetPassword(
  payload: ResetPasswordPayload,
  turnstileToken: string,
): Promise<PasswordResetMessage> {
  return API.post<PasswordResetMessage>('/auth/reset-password', {
    ...payload,
    [TURNSTILE_TOKEN_FIELD]: turnstileToken,
  });
}
