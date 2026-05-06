const TOKEN_KEY = 'admin_token';
const EXPIRES_KEY = 'admin_token_expires';

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  set(token: string, expiresAt: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_KEY, expiresAt);
  },

  remove(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  },

  isExpired(): boolean {
    const expires = localStorage.getItem(EXPIRES_KEY);
    if (!expires) return true;
    return new Date(expires).getTime() < Date.now();
  },

  getExpiresAt(): string | null {
    return localStorage.getItem(EXPIRES_KEY);
  },
};
