import { useState, useEffect } from 'react';
import { API_BASE_URL } from './api-config';

export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);

  const fetchSession = () => {
    const token = localStorage.getItem('bearer_token');
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/session`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setSession({ user: data.user });
          }
        })
        .catch(() => {})
        .finally(() => setIsPending(false));
    } else {
      setIsPending(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return { data: session, isPending, refetch: fetchSession }
};

export const authClient = {
  signOut: async () => {
    localStorage.removeItem('bearer_token');
    document.cookie = 'bearer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/';
  }
};
