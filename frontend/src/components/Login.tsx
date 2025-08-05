// frontend/src/components/Login.tsx
import React, { useState } from 'react';
import { apiService } from '../services/api';
import type { LoginRequest } from '../types/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginRequest: LoginRequest = {
      email,
      password,
    };
    try {
      const response = await apiService.login(loginRequest);
      console.log('Login successful', response);
      // Store the token in local storage or a cookie
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
