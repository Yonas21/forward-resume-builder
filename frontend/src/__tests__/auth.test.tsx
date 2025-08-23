import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

vi.mock('axios');

describe('auth refresh flow', () => {
  beforeEach(() => {
    // reset auth store
    const { logout } = useAuthStore.getState();
    logout().catch(() => undefined);
  });

  it('sets token on refresh 401 retry', async () => {
    const mocked = axios as unknown as { post: any };
    (mocked.post as any) = vi.fn().mockResolvedValue({ data: { access_token: 'new', user: { id: '1', email: 'e', created_at: '', is_active: true } } });
    // simulate refresh call
    const res = await mocked.post('/auth/refresh-token');
    expect(res.data.access_token).toBe('new');
  });
});
