import { create } from 'zustand';
// no persisted storage for access token (memory-only)
import { authService } from '../services/authService';
import type { UserResponse, LoginRequest, SignupRequest } from '../services/authService';
import { useResumeStore } from './resumeStore';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  setAuthData: (token: string, user: UserResponse) => void;
  continueAsGuest: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: true,
      error: null,

      initializeAuth: async () => {
        // Restore guest session from sessionStorage
        try {
          const guest = sessionStorage.getItem('guest_mode') === 'true';
          if (guest) {
            set({ isGuest: true, isAuthenticated: true, isLoading: false });
            return;
          }
        } catch {}
        
        // Restore token from localStorage
        try {
          const storedToken = localStorage.getItem('auth_token');
          const storedUser = localStorage.getItem('auth_user');
          
          if (storedToken && storedUser) {
            const user = JSON.parse(storedUser);
            set({ 
              token: storedToken, 
              user: user, 
              isAuthenticated: true, 
              isLoading: true 
            });
            
            try {
              // Verify token is still valid by calling getCurrentUser
              const currentUser = await authService.getCurrentUser();
              set({ user: currentUser, isLoading: false });
              // Fetch user's resume after successful authentication
              useResumeStore.getState().fetchUserResume(currentUser.id);
            } catch (error) {
              console.error('Token validation failed:', error);
              // Clear invalid token
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
              set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await authService.login(credentials);
          
          // Persist token and user data to localStorage
          localStorage.setItem('auth_token', authData.access_token);
          localStorage.setItem('auth_user', JSON.stringify(authData.user));
          
          set({
            user: authData.user,
            token: authData.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Fetch user's resume after successful authentication
          useResumeStore.getState().fetchUserResume(authData.user.id);
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
          try { 
            sessionStorage.removeItem('guest_mode'); 
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          } catch {}
          set({ user: null, token: null, isAuthenticated: false, isGuest: false, isLoading: false, error: null });
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await authService.signup(userData);
          
          // Persist token and user data to localStorage
          localStorage.setItem('auth_token', authData.access_token);
          localStorage.setItem('auth_user', JSON.stringify(authData.user));
          
          set({
            user: authData.user,
            token: authData.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Fetch user's resume after successful authentication
          useResumeStore.getState().fetchUserResume(authData.user.id);
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
        // Persist token and user data to localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        set({
          user: user,
          token: token,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
          error: null, // Clear any previous errors on successful auth
        });
        // Fetch user's resume after successful authentication
        useResumeStore.getState().fetchUserResume(user.id);
      },

      continueAsGuest: () => {
        try { sessionStorage.setItem('guest_mode', 'true'); } catch {}
        set({ user: null, token: null, isAuthenticated: true, isGuest: true, isLoading: false, error: null });
      },
    })
);

useAuthStore.getState().initializeAuth();
