import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStorage } from '@/shared/utils/token-storage';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve token', () => {
    tokenStorage.set('test-token', '2026-12-31T00:00:00Z');
    expect(tokenStorage.get()).toBe('test-token');
  });

  it('should return null when no token exists', () => {
    expect(tokenStorage.get()).toBeNull();
  });

  it('should remove token', () => {
    tokenStorage.set('test-token', '2026-12-31T00:00:00Z');
    tokenStorage.remove();
    expect(tokenStorage.get()).toBeNull();
  });

  it('should detect expired token', () => {
    tokenStorage.set('test-token', '2020-01-01T00:00:00Z');
    expect(tokenStorage.isExpired()).toBe(true);
  });

  it('should detect valid token', () => {
    const future = new Date(Date.now() + 60000).toISOString();
    tokenStorage.set('test-token', future);
    expect(tokenStorage.isExpired()).toBe(false);
  });

  it('should return expired when no expiry set', () => {
    expect(tokenStorage.isExpired()).toBe(true);
  });
});
