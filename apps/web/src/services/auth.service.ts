import { api, setToken } from '@/lib/api';
import type { User } from '@/types';

interface LoginResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res;
}

export async function fetchMe(): Promise<User> {
  return api<User>('/auth/me');
}

export function logout() {
  setToken(null);
}