import apiClient from './client';

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName?: string | null;
  lastName?: string | null;
}

export async function register(payload: RegisterRequest): Promise<void> {
  await apiClient.post('/auth/register', payload);
}

export interface PasswordResetRequestPayload {
  email: string;
}

export async function requestPasswordReset(payload: PasswordResetRequestPayload): Promise<void> {
  await apiClient.post('/auth/password-reset', payload);
}

export interface PasswordResetConfirmPayload {
  token: string;
  password: string;
}

export async function confirmPasswordReset(payload: PasswordResetConfirmPayload): Promise<void> {
  await apiClient.post('/auth/password-reset/confirm', payload);
}
