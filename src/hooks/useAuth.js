import { useState } from 'react';
import { API_BASE } from '../utils/constants';

export const useAuth = () => {
  const [token, setToken] = useState(
    localStorage.getItem('token')
  );
  
  const login = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Login failed');

    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    
    return data;
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };
  
  return { token, login, logout };
};