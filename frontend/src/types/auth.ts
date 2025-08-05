// frontend/src/types/auth.ts
export interface SignupRequest {
  email: string;
  hashed_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
