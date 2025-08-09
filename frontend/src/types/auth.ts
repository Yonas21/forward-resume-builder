// frontend/src/types/auth.ts
export interface SignupRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  is_active: boolean;
}
