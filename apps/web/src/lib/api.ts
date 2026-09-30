const TOKEN_KEY = 'bt_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type ApiOptions = RequestInit & { auth?: boolean };

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = true, headers, body, ...rest } = options;

  const h: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };

  // Hanya set Content-Type kalau ada body
  if (body !== undefined && body !== null && !h['Content-Type']) {
    h['Content-Type'] = 'application/json';
  }

  if (auth) {
    const t = getToken();
    if (t) h.Authorization = 'Bearer ' + t;
  }

  const res = await fetch('/api' + path, { ...rest, body, headers: h });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message || data?.error || 'Request failed (' + res.status + ')';
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}