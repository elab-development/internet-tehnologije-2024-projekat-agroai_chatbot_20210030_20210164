import { useState } from 'react';
import axios from 'axios';

/**
 * useAuth:
 *   - submitAuth(mode, payload) will POST to /api/login or /api/register.
 *   - On success, writes token + user data into sessionStorage.
 *   - On failure, sets `error`.
 */
export default function useAuth() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * mode: 'login' or 'register'
   * payload: { name?, email, password, password_confirmation?, image_url?, role }
   */
  const submitAuth = async (mode, payload) => {
    setError('');
    setIsLoading(true);

    const endpoint =
      mode === 'login'
        ? 'http://127.0.0.1:8000/api/login'
        : 'http://127.0.0.1:8000/api/register';

    try {
      const response = await axios.post(endpoint, payload, {
        headers: { Accept: 'application/json' },
      });

      const data = response.data;
      const token = data.token;
      if (!token) {
        throw new Error('No token returned from server.');
      }

      // Store in sessionStorage
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userId', data.id);
      sessionStorage.setItem('userName', data.name);
      sessionStorage.setItem('userEmail', data.email);
      sessionStorage.setItem('userRole', data.role);
      sessionStorage.setItem('userImage', data.imageUrl || '');

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Auth error:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Something went wrong';
      setError(serverMsg);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    error,
    isLoading,
    submitAuth,
  };
}
