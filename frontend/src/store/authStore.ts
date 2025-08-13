import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { UserResponse, LoginRequest, SignupRequest } from '../services/authService';
import { useResumeStore } from './resumeStore';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  setAuthData: (token: string, user: UserResponse) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      initializeAuth: async () => {
        const token = get().token;
        if (token) {
          try {
            set({ isAuthenticated: true, isLoading: true });
            const currentUser = await authService.getCurrentUser();
            set({ user: currentUser, isLoading: false });
            // Fetch user's resume after successful authentication
            useResumeStore.getState().fetchUserResume(currentUser.id);
          } catch (error) {
            console.error('Auth initialization error:', error);
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await authService.login(credentials);
          set({
            user: authData.user,
            token: authData.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          get().initializeAuth();
        } catch (error: unknown) {
          if (error instanceof Error) {
            set({ error: error.message, isLoading: false });
          }
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout API call failed, proceeding with local logout.', error);
        } finally {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await authService.signup(userData);
          set({
            user: authData.user,
            token: authData.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          if (error instanceof Error) {
            set({ error: error.message, isLoading: false });
          }
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setAuthData: (token, user) => {
        set({
          user: user,
          token: token,
          isAuthenticated: true,
          isLoading: false,
          error: null, // Clear any previous errors on successful auth
        });
        // Fetch user's resume after successful authentication
        useResumeStore.getState().fetchUserResume(user.id);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

useAuthStore.getState().initializeAuth();
